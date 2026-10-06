import { provideTranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { LotList } from './lot-list';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

describe('LotList', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTranslateService()] }));
  function setup() {
    const fixture = TestBed.createComponent(LotList);
    fixture.componentRef.setInput('products', [
      new Product(1, 1, 1, 'Coca Cola'),
      new Product(2, 1, 1, 'Arroz'),
    ]);
    fixture.componentRef.setInput(
      'lots',
      Array.from(
        { length: 6 },
        (_, index) =>
          new Lot(
            index + 1,
            index === 5 ? 2 : 1,
            `BATCH-${index + 1}`,
            10,
            null,
            '2026-10-05',
            index !== 5,
          ),
      ),
    );
    fixture.detectChanges();
    return fixture;
  }

  it('renders only the current page and shows product names', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Coca Cola');
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 6 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(1);
    expect(component.paginatedLots()[0].batchNumber).toBe('BATCH-6');
  });

  it('combines search, product and status filters and resets pagination', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 6 });
    component.searchTerm.set(' arroz ');
    expect(component.pageIndex()).toBe(0);
    expect(component.filteredLots().length).toBe(1);
    component.selectedProductId.set(1);
    expect(component.filteredLots().length).toBe(0);
    component.searchTerm.set('BATCH');
    component.selectedStatus.set('inactive');
    expect(component.filteredLots().length).toBe(0);
    component.selectedProductId.set(2);
    expect(component.filteredLots().length).toBe(1);
  });

  it('returns to the previous page after deleting the only item on the last page', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 6 });
    expect(component.pageIndex()).toBe(1);
    fixture.componentRef.setInput('lots', component.lots().slice(0, 5));
    expect(component.pageIndex()).toBe(0);
    expect(component.paginatedLots().length).toBe(5);
  });
});
