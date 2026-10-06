import { TestBed } from '@angular/core/testing';
import { LotForm } from './lot-form';
import { Product } from '../../../domain/model/product.entity';
import { Lot } from '../../../domain/model/lot.entity';

describe('LotForm', () => {
  function setup(lot: Lot | null = null) {
    const fixture = TestBed.createComponent(LotForm);
    fixture.componentRef.setInput('products', [new Product(1, 1, 1, 'Coca Cola')]);
    fixture.componentRef.setInput('lot', lot);
    fixture.detectChanges();
    return fixture;
  }

  it('requires a registered product, batch number, non-negative quantity and valid entry date', () => {
    const fixture = setup();
    const form = fixture.componentInstance.form;
    expect(form.invalid).toBe(true);
    form.patchValue({ productId: 1, batchNumber: 'CC-001', quantity: 0, entryDate: '2026-10-05' });
    expect(form.valid).toBe(true);
    form.controls.productId.setValue(999);
    expect(form.invalid).toBe(true);
    form.patchValue({ productId: 1, batchNumber: '   ' });
    expect(form.invalid).toBe(true);
    form.patchValue({ batchNumber: 'CC-001', quantity: -1 });
    expect(form.invalid).toBe(true);
    form.patchValue({ quantity: 1, entryDate: '2026-02-30' });
    expect(form.invalid).toBe(true);
  });

  it('allows no expiration date and rejects malformed or nonexistent dates', () => {
    const fixture = setup(new Lot(7, 1, 'CC-001', 2, null, '2026-10-05', false));
    const form = fixture.componentInstance.form;
    expect(form.valid).toBe(true);
    for (const date of ['invalid', '2026-02-29', '2026-13-01']) {
      form.controls.expirationDate.setValue(date);
      expect(form.invalid).toBe(true);
    }
    form.controls.expirationDate.setValue('2028-02-29');
    expect(form.valid).toBe(true);
  });

  it('preserves the lot identity on edit and emits trimmed data with null expiration', () => {
    const fixture = setup(new Lot(7, 1, 'CC-001', 2, null, '2026-10-05', false));
    const component = fixture.componentInstance;
    const saved = vi.fn();
    component.lotSaved.subscribe(saved);
    component.form.controls.batchNumber.setValue(' CC-002 ');
    component.onSubmit();
    expect(saved).toHaveBeenCalledWith(new Lot(7, 1, 'CC-002', 2, null, '2026-10-05', false));
  });
});
