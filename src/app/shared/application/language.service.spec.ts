import english from '../../../../public/i18n/en.json';
import spanish from '../../../../public/i18n/es.json';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from './language.service';
import { LanguageSwitcher } from '../presentation/components/language-switcher/language-switcher';
import { PhysicalCountForm } from '../../inventory/presentation/components/physical-count-form/physical-count-form';
import { PhysicalCountList } from '../../inventory/presentation/components/physical-count-list/physical-count-list';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Lot } from '../../inventory/domain/model/lot.entity';
import { PhysicalCount } from '../../inventory/domain/model/physical-count.entity';

const catalogs = { en: english, es: spanish };

describe('Language switcher and translated physical counts', () => {
  beforeEach(() => {
    localStorage.removeItem('bodego_language');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: provideTranslateHttpLoader({
            prefix: '/i18n/',
            suffix: '.json',
            failOnError: true,
          }),
        }),
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('bodego_language');
    document.documentElement.lang = 'en';
  });

  it('loads Spanish by default and changes form and paginator labels without losing form values', async () => {
    const language = TestBed.inject(LanguageService);
    const http = TestBed.inject(HttpTestingController);
    const initial = language.initialize();
    http.expectOne('/i18n/es.json').flush(catalogs.es);
    await initial;
    const form = TestBed.createComponent(PhysicalCountForm);
    form.componentRef.setInput('lots', [new Lot(1, 1, 'CC-2026-001', 24)]);
    form.componentRef.setInput('products', []);
    await form.whenStable();
    form.componentInstance.form.patchValue({
      lotId: 1,
      physicalQuantity: 22,
      date: '2026-10-06',
      observation: 'Two missing',
    });
    const original = form.componentInstance.form.getRawValue();
    form.detectChanges();
    expect(form.nativeElement.textContent).toContain('Registrar conteo');
    const list = TestBed.createComponent(PhysicalCountList);
    list.componentRef.setInput('lots', []);
    list.componentRef.setInput('products', []);
    list.componentRef.setInput('counts', [new PhysicalCount(1, 1, 2, 24, 22, '2026-10-06')]);
    await list.whenStable();
    const paginator = list.debugElement.injector.get(MatPaginatorIntl);
    expect(paginator.itemsPerPageLabel).toBe('Conteos por página:');
    expect(paginator.getRangeLabel(0, 5, 1)).toBe('1–1 de 1');
    const switcher = TestBed.createComponent(LanguageSwitcher);
    await switcher.whenStable();
    const buttons = switcher.nativeElement.querySelectorAll('button');
    buttons[1].click();
    http.expectOne('/i18n/en.json').flush(catalogs.en);
    await switcher.whenStable();
    await form.whenStable();
    await list.whenStable();
    expect(form.nativeElement.textContent).toContain('Record count');
    expect(form.componentInstance.form.getRawValue()).toEqual(original);
    expect(form.componentInstance.difference()).toBe(-2);
    expect(paginator.itemsPerPageLabel).toBe('Counts per page:');
    expect(paginator.getRangeLabel(0, 5, 1)).toBe('1–1 of 1');
    expect(localStorage.getItem('bodego_language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(
      switcher.nativeElement.querySelector('mat-button-toggle-group').getAttribute('aria-label'),
    ).toBe('Language');
  });

  it('restores the saved language and preserves it when the other catalog fails to load', async () => {
    localStorage.setItem('bodego_language', 'en');
    const language = TestBed.inject(LanguageService);
    const http = TestBed.inject(HttpTestingController);
    const initial = language.initialize();
    http.expectOne('/i18n/en.json').flush(catalogs.en);
    await initial;
    const change = language.changeLanguage('es');
    http.expectOne('/i18n/es.json').flush({}, { status: 500, statusText: 'Server error' });
    await change;
    expect(language.error()).toBe(true);
    expect(language.loading()).toBe(false);
    expect(language.currentLanguage()).toBe('en');
    expect(localStorage.getItem('bodego_language')).toBe('en');
  });
});
