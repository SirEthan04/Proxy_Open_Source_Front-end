import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import spanishLocale from '@angular/common/locales/es';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from '../../app.routes';
import { provideTestTranslations } from '../../shared/application/translation.testing';
import { LanguageService } from '../../shared/application/language.service';
import { LocalizedPaginatorIntl } from '../../shared/presentation/components/localized-paginator-intl';
import { ProductDialog } from './components/product-dialog/product-dialog';
import { LotDialog } from './components/lot-dialog/lot-dialog';
import { MovementDialog } from './components/movement-dialog/movement-dialog';
import { ProductForm } from './components/product-form/product-form';
import { LotForm } from './components/lot-form/lot-form';
import { MovementForm } from './components/movement-form/movement-form';
import { Alerts } from './views/alerts/alerts';
import { Alert } from '../domain/model/alert.entity';

registerLocaleData(spanishLocale);

describe('Language selection throughout the inventory UI', () => {
  beforeEach(() => {
    localStorage.setItem(
      'bodego_user',
      JSON.stringify({ id: 1, name: 'BodeGo Admin', email: 'admin@bodego.com', role: 'ADMIN' }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTestTranslations(),
        { provide: MatPaginatorIntl, useClass: LocalizedPaginatorIntl },
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('bodego_user');
    localStorage.removeItem('bodego_language');
    document.documentElement.lang = 'en';
  });

  it('changes headings, empty states and paginators on every inventory route using ES / EN', async () => {
    const harness = await RouterTestingHarness.create();
    const http = TestBed.inject(HttpTestingController);
    const screens = [
      ['products', 'Products', 'Productos', 'Search products', 'Buscar productos'],
      ['lots', 'Lots', 'Lotes', 'No lots registered.', 'No hay lotes registrados.'],
      [
        'movements',
        'Movements',
        'Movimientos',
        'No movements recorded yet.',
        'Todavía no hay movimientos registrados.',
      ],
      [
        'dashboard',
        'Dashboard',
        'Panel de control',
        'Welcome, BodeGo Admin.',
        'Bienvenido, BodeGo Admin.',
      ],
      [
        'alerts',
        'Inventory alerts',
        'Alertas de inventario',
        'No inventory alerts at this time.',
        'No hay alertas de inventario en este momento.',
      ],
    ];
    for (const language of ['es', 'en']) {
      for (const [path, enTitle, esTitle, enText, esText] of screens) {
        await harness.navigateByUrl('/' + path);
        http.match((request) => request.method === 'GET').forEach((request) => request.flush([]));
        await harness.fixture.whenStable();
        const selector = harness.routeNativeElement?.querySelector('app-language-switcher');
        selector?.querySelectorAll<HTMLButtonElement>('button')[language === 'es' ? 0 : 1].click();
        await harness.fixture.whenStable();
        harness.detectChanges();
        const screen = harness.routeNativeElement?.querySelector('app-' + path);
        expect(screen?.querySelector('h1')?.textContent).toBe(
          language === 'es' ? esTitle : enTitle,
        );
        expect(screen?.textContent).toContain(language === 'es' ? esText : enText);
      }
      const paginator = TestBed.inject(MatPaginatorIntl);
      await harness.fixture.whenStable();
      expect(paginator.itemsPerPageLabel).toBe(
        language === 'es' ? 'Elementos por página:' : 'Items per page:',
      );
      expect(paginator.getRangeLabel(0, 5, 10)).toBe(language === 'es' ? '1–5 de 10' : '1–5 of 10');
    }
  });

  it('updates open product, lot and movement dialogs without clearing entered form data', async () => {
    const language = TestBed.inject(LanguageService);
    const dialog = TestBed.inject(MatDialog);
    const product = dialog.open(ProductDialog, { data: { product: null, categories: [] } });
    const lot = dialog.open(LotDialog, { data: { lot: null, products: [] } });
    const movement = dialog.open(MovementDialog, { data: { lots: [], products: [] } });
    const productForm = TestBed.createComponent(ProductForm);
    productForm.componentRef.setInput('categories', []);
    const lotForm = TestBed.createComponent(LotForm);
    lotForm.componentRef.setInput('products', []);
    const movementForm = TestBed.createComponent(MovementForm);
    movementForm.componentRef.setInput('products', []);
    movementForm.componentRef.setInput('lots', []);
    await Promise.all([productForm.whenStable(), lotForm.whenStable(), movementForm.whenStable()]);
    productForm.componentInstance.form.controls.name.setValue('Coca Cola 500ml');
    lotForm.componentInstance.form.controls.batchNumber.setValue('CC-2026-001');
    movementForm.componentInstance.form.controls.reason.setValue('Supplier delivery');
    await language.changeLanguage('es');
    await Promise.all([productForm.whenStable(), lotForm.whenStable(), movementForm.whenStable()]);
    expect(document.querySelector('app-product-dialog')?.textContent).toContain('Nuevo producto');
    expect(document.querySelector('app-lot-dialog')?.textContent).toContain('Nuevo lote');
    expect(document.querySelector('app-movement-dialog')?.textContent).toContain(
      'Registrar movimiento de inventario',
    );
    expect(productForm.nativeElement.textContent).toContain('Nombre');
    expect(lotForm.nativeElement.textContent).toContain('Número de lote');
    expect(movementForm.nativeElement.textContent).toContain('Motivo');
    expect(productForm.componentInstance.form.controls.name.value).toBe('Coca Cola 500ml');
    expect(lotForm.componentInstance.form.controls.batchNumber.value).toBe('CC-2026-001');
    expect(movementForm.componentInstance.form.controls.reason.value).toBe('Supplier delivery');
    product.close();
    lot.close();
    movement.close();
  });

  it('translates generated alert snapshots and preserves custom messages', async () => {
    const component = TestBed.createComponent(Alerts).componentInstance;
    const lowStock = new Alert(
      1,
      1,
      null,
      'LOW_STOCK',
      'WARNING',
      'Available stock (9) is at or below the minimum (67).',
    );
    await TestBed.inject(LanguageService).changeLanguage('es');
    expect(component.alertMessage(lowStock)).toBe(
      'El stock disponible (9) está en el mínimo (67) o por debajo.',
    );
    const custom = new Alert(2, 1, null, 'LOW_STOCK', 'WARNING', 'Revisar estante');
    expect(component.alertMessage(custom)).toBe('Revisar estante');
    expect(lowStock.message).toBe('Available stock (9) is at or below the minimum (67).');
  });

  it('keeps the selected language on sign-out and exposes the switch on sign-in', async () => {
    const harness = await RouterTestingHarness.create('/products');
    TestBed.inject(HttpTestingController)
      .match((request) => request.method === 'GET')
      .forEach((request) => request.flush([]));
    await TestBed.inject(LanguageService).changeLanguage('es');
    await harness.fixture.whenStable();
    harness.routeNativeElement?.querySelector<HTMLButtonElement>('.sign-out-button')?.click();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain(
      'Inicia sesión para gestionar tu inventario',
    );
    expect(harness.routeNativeElement?.querySelector('app-language-switcher')).toBeTruthy();
    expect(localStorage.getItem('bodego_language')).toBe('es');
  });
});
