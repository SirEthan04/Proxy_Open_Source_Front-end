import { provideTestTranslations } from '../../shared/application/translation.testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app.routes';
import { IamStore } from '../../iam/application/iam.store';
import { PhysicalCountDialog } from './components/physical-count-dialog/physical-count-dialog';
import { MatDialog } from '@angular/material/dialog';

describe('Physical counts routing and existing inventory navigation', () => {
  beforeEach(() => {
    localStorage.removeItem('bodego_user');
    TestBed.configureTestingModule({
      providers: [
        provideTestTranslations(),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    TestBed.inject(HttpTestingController).verify();
    localStorage.removeItem('bodego_user');
  });

  it('redirects unauthenticated users to sign-in', async () => {
    const harness = await RouterTestingHarness.create('/physical-counts');
    expect(TestBed.inject(Router).url).toBe('/sign-in');
    expect(harness.routeNativeElement?.querySelector('app-physical-counts')).toBeNull();
  });

  for (const role of ['ADMIN', 'EMPLOYEE']) {
    it(`preserves ${role} access, navigation, mobile menu, save ownership and sign-out`, async () => {
      localStorage.setItem(
        'bodego_user',
        JSON.stringify({ id: 2, name: 'BodeGo Employee', email: 'employee@bodego.com', role }),
      );
      const harness = await RouterTestingHarness.create('/physical-counts');
      const http = TestBed.inject(HttpTestingController);
      const lot = {
        id: 1,
        productId: 1,
        batchNumber: 'CC-2026-001',
        quantity: 24,
        expirationDate: null,
        entryDate: '2026-10-01',
        active: true,
      };
      http.expectOne('http://localhost:3000/api/v1/physicalCounts').flush([]);
      http.expectOne('http://localhost:3000/api/v1/lots').flush([lot]);
      http.expectOne('http://localhost:3000/api/v1/products').flush([]);
      harness.detectChanges();
      expect(harness.routeNativeElement?.querySelector('a[href="/physical-counts"]')).toBeTruthy();
      const menu = harness.routeNativeElement?.querySelector<HTMLButtonElement>('.menu-toggle');
      menu?.click();
      harness.detectChanges();
      expect(menu?.getAttribute('aria-expanded')).toBe('true');
      harness.routeNativeElement
        ?.querySelector<HTMLAnchorElement>('a[href="/physical-counts"]')
        ?.click();
      await harness.fixture.whenStable();
      harness.detectChanges();
      expect(menu?.getAttribute('aria-expanded')).toBe('false');
      const ref = TestBed.inject(MatDialog).open(PhysicalCountDialog, {
        data: { lots: [lot], products: [] },
      });
      ref.componentInstance.onSave({
        lotId: 1,
        systemQuantity: 24,
        physicalQuantity: 22,
        date: '2026-10-06',
        observation: '',
      });
      const post = http.expectOne('http://localhost:3000/api/v1/physicalCounts');
      expect(post.request.body.userId).toBe(2);
      post.flush({ ...post.request.body, id: 1 });
      for (const path of ['products', 'lots', 'movements', 'dashboard']) {
        await harness.navigateByUrl(`/${path}`);
        const requests = http.match((request) => request.method === 'GET');
        requests.forEach((request) => request.flush([]));
        harness.detectChanges();
        expect(TestBed.inject(Router).url).toBe(`/${path}`);
        expect(harness.routeNativeElement?.querySelector(`app-${path}`)).toBeTruthy();
      }
      harness.routeNativeElement?.querySelector<HTMLButtonElement>('.sign-out-button')?.click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(IamStore).currentUser()).toBeNull();
      expect(localStorage.getItem('bodego_user')).toBeNull();
      await harness.navigateByUrl('/physical-counts');
      expect(TestBed.inject(Router).url).toBe('/sign-in');
    });
  }
});
