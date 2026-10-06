import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InventoryStore } from './inventory.store';
import { Lot } from '../domain/model/lot.entity';

describe('InventoryStore lots CRUD', () => {
  let store: InventoryStore;
  let http: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/v1/lots';
  const lot = new Lot(1, 1, 'CC-001', 12, null, '2026-10-05', true);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(InventoryStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads, creates, updates and deletes using server identities without changing products', () => {
    store.loadLots();
    expect(store.lotsLoading()).toBe(true);
    http.expectOne(baseUrl).flush([lot]);
    expect(store.lotsLoading()).toBe(false);
    expect(store.lots()[0]).toBeInstanceOf(Lot);
    store.createLot(new Lot(0, 1, 'CC-002', 4, null, '2026-10-05'));
    const create = http.expectOne(baseUrl);
    expect(create.request.method).toBe('POST');
    expect(create.request.body.id).toBeUndefined();
    create.flush({ ...lot, id: 2, batchNumber: 'CC-002', quantity: 4 });
    expect(store.lots().length).toBe(2);
    store.updateLot(new Lot(2, 1, 'CC-002', 0, null, '2026-10-05', false));
    const update = http.expectOne(`${baseUrl}/2`);
    expect(update.request.method).toBe('PUT');
    update.flush({ ...lot, id: 2, batchNumber: 'CC-002', quantity: 0, active: false });
    expect(store.lots()[1].quantity).toBe(0);
    store.deleteLot(2);
    const remove = http.expectOne(`${baseUrl}/2`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush({});
    expect(store.lots().map((lot) => lot.id)).toEqual([1]);
    expect(store.products()).toEqual([]);
  });

  it('keeps state when a write fails and exposes an actionable error', () => {
    store.loadLots();
    http.expectOne(baseUrl).flush([lot]);
    store.deleteLot(1);
    http.expectOne(`${baseUrl}/1`).flush({}, { status: 500, statusText: 'Server error' });
    expect(store.lots()).toEqual([lot]);
    expect(store.lotsError()).toContain('Could not delete');
  });
});
