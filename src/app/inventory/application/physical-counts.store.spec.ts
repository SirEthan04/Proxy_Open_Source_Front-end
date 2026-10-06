import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InventoryStore } from './inventory.store';
import { PhysicalCount } from '../domain/model/physical-count.entity';

describe('Physical count history', () => {
  let store: InventoryStore;
  let http: HttpTestingController;
  const url = 'http://localhost:3000/api/v1/physicalCounts';
  const lot = {
    id: 1,
    productId: 1,
    batchNumber: 'CC-2026-001',
    quantity: 24,
    expirationDate: null,
    entryDate: '2026-10-01',
    active: true,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(InventoryStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function load(): void {
    store.loadPhysicalCounts();
    http.expectOne(url).flush([]);
    http.expectOne('http://localhost:3000/api/v1/lots').flush([lot]);
    http.expectOne('http://localhost:3000/api/v1/products').flush([]);
  }

  it('posts the snapshot and calculated difference without writing lots or movements', () => {
    load();
    const lotsBefore = store.lots();
    const done = vi.fn();
    store.createPhysicalCount(
      new PhysicalCount(0, 1, 2, 24, 22, '2026-10-06', 'Two missing'),
      done,
    );
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      lotId: 1,
      userId: 2,
      systemQuantity: 24,
      physicalQuantity: 22,
      difference: -2,
      date: '2026-10-06',
      observation: 'Two missing',
    });
    expect(store.physicalCountsSaving()).toBe(true);
    request.flush({ ...request.request.body, id: 9 });
    expect(store.physicalCounts()[0].id).toBe(9);
    expect(store.physicalCounts()[0].difference).toBe(-2);
    expect(store.lots()).toBe(lotsBefore);
    expect(store.lots()[0].quantity).toBe(24);
    expect(store.movements()).toEqual([]);
    expect(store.physicalCountsSaving()).toBe(false);
    expect(done).toHaveBeenCalledOnce();
    // afterEach verifies there are no unhandled stock adjustment requests.
  });

  it('preserves history after a failed save and allows retry', () => {
    load();
    const failed = vi.fn();
    const count = new PhysicalCount(0, 1, 2, 24, 0, '2026-10-06');
    store.createPhysicalCount(count, undefined, failed);
    store.createPhysicalCount(count);
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    expect(store.physicalCounts()).toEqual([]);
    expect(store.physicalCountsSaving()).toBe(false);
    expect(failed).toHaveBeenCalledOnce();
    store.createPhysicalCount(count);
    http.expectOne(url).flush({ ...count, difference: -24, id: 1 });
    expect(store.physicalCounts()[0].difference).toBe(-24);
  });
});
