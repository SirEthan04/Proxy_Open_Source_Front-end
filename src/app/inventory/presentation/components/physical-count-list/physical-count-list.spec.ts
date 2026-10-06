import { provideTestTranslations } from '../../../../shared/application/translation.testing';
import { TestBed } from '@angular/core/testing';
import { PhysicalCountList } from './physical-count-list';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { User } from '../../../../iam/domain/model/user.entity';

describe('PhysicalCountList', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTestTranslations()] }));
  it('searches readable labels, filters discrepancies and resets pagination', async () => {
    const fixture = TestBed.createComponent(PhysicalCountList);
    fixture.componentRef.setInput('lots', [new Lot(1, 1, 'CC-2026-001', 24)]);
    fixture.componentRef.setInput('products', [new Product(1, 1, 1, 'Coca Cola 500ml')]);
    fixture.componentRef.setInput(
      'currentUser',
      new User(2, 'BodeGo Employee', 'employee@bodego.com', 'EMPLOYEE'),
    );
    fixture.componentRef.setInput(
      'counts',
      Array.from(
        { length: 12 },
        (_, index) =>
          new PhysicalCount(index + 1, 1, 2, 24, index % 2 ? 24 : 22, '2026-10-06', 'Shelf check'),
      ),
    );
    await fixture.whenStable();
    const list = fixture.componentInstance;
    expect(list.pageCounts()).toHaveLength(5);
    list.pageIndex.set(2);
    expect(list.pageCounts()).toHaveLength(2);
    list.selectedStatus.set('SHORTAGE');
    expect(list.filtered()).toHaveLength(6);
    expect(list.pageIndex()).toBe(0);
    list.searchTerm.set('coca cola');
    expect(list.filtered()).toHaveLength(6);
    list.searchTerm.set('bodego employee');
    expect(list.filtered()).toHaveLength(6);
    list.searchTerm.set('nonexistent');
    expect(list.filtered()).toHaveLength(0);
    expect(list.pageIndex()).toBe(0);
    expect(list.userName(1)).toBe('User #1');
    expect(list.productName(999)).toBe('Product unavailable');
    expect(list.status(2)).toBe('SURPLUS');
  });
});
