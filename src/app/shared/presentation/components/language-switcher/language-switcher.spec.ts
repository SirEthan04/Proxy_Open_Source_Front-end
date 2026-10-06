import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Layout } from '../../layout/layout';

describe('Language switcher', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('bodego_language');
    document.documentElement.lang = 'en';
  });

  it('loads both dictionaries, translates navigation and remembers the selected language', async () => {
    localStorage.removeItem('bodego_user');
    TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          lang: 'en',
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
        }),
      ],
    });
    const fixture = TestBed.createComponent(Layout);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('./i18n/en.json').flush({
      language: { label: 'Language' },
      nav: { products: 'Products' },
    });
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector<HTMLSelectElement>('select')!;
    expect(element.querySelector('a[href="/products"]')?.textContent).toContain('Products');

    select.value = 'es';
    select.dispatchEvent(new Event('change'));
    http.expectOne('./i18n/es.json').flush({
      language: { label: 'Idioma' },
      nav: { products: 'Productos' },
    });
    await fixture.whenStable();
    expect(element.querySelector('a[href="/products"]')?.textContent).toContain('Productos');
    expect(element.querySelector('label')?.textContent).toContain('Idioma');
    expect(document.documentElement.lang).toBe('es');
    expect(localStorage.getItem('bodego_language')).toBe('es');

    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(element.querySelector('a[href="/products"]')?.textContent).toContain('Products');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('bodego_language')).toBe('en');
  });
});
