import { provideTestTranslations } from '../../shared/application/translation.testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app.routes';
import { IamStore } from '../../iam/application/iam.store';
import { SignInCommand } from '../../iam/domain/model/sign-in.command';
import { UserRole } from '../../iam/domain/model/user.entity';

describe('Inventory routes inside the authenticated Layout', () => {
  beforeEach(() => {
    localStorage.removeItem('bodego_user');
    TestBed.configureTestingModule({
      providers: [provideTestTranslations(), provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('bodego_user');
  });

  it('redirects unauthenticated visitors from Lots and Products to sign-in', async () => {
    const harness = await RouterTestingHarness.create();
    for (const url of ['/lots', '/products']) {
      await harness.navigateByUrl(url);
      expect(TestBed.inject(Router).url).toBe('/sign-in');
      expect(harness.routeNativeElement?.querySelector('app-lots')).toBeNull();
    }
  });

  for (const role of ['ADMIN', 'EMPLOYEE'] satisfies UserRole[]) {
    it(`loads Products and Lots with the persisted ${role} session and existing navigation`, async () => {
      localStorage.setItem(
        'bodego_user',
        JSON.stringify({ id: 1, name: 'BodeGo User', email: 'user@bodego.com', role }),
      );
      const harness = await RouterTestingHarness.create('/products');
      const http = TestBed.inject(HttpTestingController);
      const product = {
        id: 1,
        businessId: 1,
        categoryId: 1,
        name: 'Coca Cola',
        description: 'Bebida',
        price: 3.5,
        minimumStock: 10,
        active: true,
      };
      http.expectOne('http://localhost:3000/api/v1/products').flush([product]);
      http
        .expectOne('http://localhost:3000/api/v1/categories')
        .flush([{ id: 1, name: 'Bebidas', description: 'Bebidas' }]);
      harness.detectChanges();
      expect(harness.routeNativeElement?.querySelector('app-products')?.textContent).toContain(
        'Coca Cola',
      );
      expect(harness.routeNativeElement?.querySelector('a[href="/lots"]')).toBeTruthy();
      await harness.navigateByUrl('/lots');
      http.expectOne('http://localhost:3000/api/v1/products').flush([product]);
      http
        .expectOne('http://localhost:3000/api/v1/lots')
        .flush([
          {
            id: 1,
            productId: 1,
            batchNumber: 'CC-001',
            quantity: 12,
            expirationDate: null,
            entryDate: '2026-10-05',
            active: true,
          },
        ]);
      harness.detectChanges();
      expect(TestBed.inject(Router).url).toBe('/lots');
      expect(harness.routeNativeElement?.querySelector('app-lots')?.textContent).toContain(
        'CC-001',
      );
      expect(harness.routeNativeElement?.querySelector('app-lots')?.textContent).toContain(
        'Coca Cola',
      );
      expect(TestBed.inject(IamStore).currentUser()?.role).toBe(role);
      const signOut =
        harness.routeNativeElement?.querySelector<HTMLButtonElement>('.sign-out-button');
      expect(signOut).toBeTruthy();
      signOut?.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/sign-in');
      await harness.navigateByUrl('/products');
      expect(TestBed.inject(Router).url).toBe('/sign-in');
      expect(localStorage.getItem('bodego_user')).toBeNull();
    });
  }

  it('keeps sign-in and session persistence working', () => {
    const iam = TestBed.inject(IamStore);
    const http = TestBed.inject(HttpTestingController);
    iam.signIn(new SignInCommand('admin@bodego.com', 'admin123'));
    const request = http.expectOne((request) => request.url.endsWith('/users'));
    expect(request.request.params.get('email')).toBe('admin@bodego.com');
    request.flush([{ id: 1, name: 'Admin', email: 'admin@bodego.com', role: 'ADMIN' }]);
    expect(iam.isAuthenticated()).toBe(true);
    expect(iam.isAdmin()).toBe(true);
    expect(localStorage.getItem('bodego_user')).toContain('ADMIN');
  });
});
