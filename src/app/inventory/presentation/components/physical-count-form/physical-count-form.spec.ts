import { provideTestTranslations } from '../../../../shared/application/translation.testing';
import { TestBed } from '@angular/core/testing';
import { PhysicalCountForm } from './physical-count-form';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

describe('PhysicalCountForm', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTestTranslations()] }));
  async function setup() {
    const fixture = TestBed.createComponent(PhysicalCountForm);
    fixture.componentRef.setInput('lots', [
      new Lot(1, 1, 'CC-2026-001', 24),
      new Lot(2, 1, 'CC-2026-002', 12),
    ]);
    fixture.componentRef.setInput('products', [new Product(1, 1, 1, 'Coca Cola 500ml')]);
    await fixture.whenStable();
    return fixture;
  }

  it('derives the quantity and difference from the selected lot, including a zero count', async () => {
    const fixture = await setup();
    const form = fixture.componentInstance;
    const saved = vi.fn();
    form.countSaved.subscribe(saved);
    form.form.patchValue({
      lotId: 1,
      physicalQuantity: 22,
      date: '2026-10-06',
      observation: ' Two missing ',
    });
    expect(form.difference()).toBe(-2);
    form.onSubmit();
    expect(saved).toHaveBeenLastCalledWith({
      lotId: 1,
      systemQuantity: 24,
      physicalQuantity: 22,
      date: '2026-10-06',
      observation: 'Two missing',
    });
    form.form.patchValue({ lotId: 2, physicalQuantity: 0 });
    expect(form.difference()).toBe(-12);
    form.onSubmit();
    expect(saved.mock.lastCall?.[0].systemQuantity).toBe(12);
    expect(form.lots()[1].quantity).toBe(12);
    form.form.controls.physicalQuantity.setValue(14);
    expect(form.difference()).toBe(2);
    form.form.controls.physicalQuantity.setValue(12);
    expect(form.difference()).toBe(0);
    expect(form.lotLabel(form.lots()[0])).toContain('Coca Cola 500ml');
  });

  it('rejects missing lots, negative or nonfinite quantities, and invalid dates', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const saved = vi.fn();
    component.countSaved.subscribe(saved);
    component.form.patchValue({ lotId: 999, physicalQuantity: 1, date: '2026-10-06' });
    component.onSubmit();
    component.form.controls.lotId.setValue(1);
    for (const quantity of [-1, NaN, Infinity, null]) {
      component.form.controls.physicalQuantity.setValue(quantity);
      component.onSubmit();
    }
    component.form.controls.physicalQuantity.setValue(0);
    for (const date of ['', 'invalid', '2026-02-30']) {
      component.form.controls.date.setValue(date);
      component.onSubmit();
    }
    expect(saved).not.toHaveBeenCalled();
  });
});
