import { TranslatePipe } from '@ngx-translate/core';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

const validDate: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { date: true };
  }
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? null
    : { date: true };
};

const nonBlank: ValidatorFn = (control) => {
  const value: unknown = control.value;
  return typeof value === 'string' && value.trim() ? null : { required: true };
};

@Component({
  selector: 'app-lot-form',
  imports: [TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './lot-form.html',
  styleUrl: './lot-form.css',
})
export class LotForm {
  private readonly formBuilder = inject(FormBuilder);
  readonly products = input.required<Product[]>();
  readonly lot = input<Lot | null>(null);
  readonly lotSaved = output<Lot>();

  readonly form = this.formBuilder.nonNullable.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    batchNumber: ['', [Validators.required, nonBlank]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    entryDate: ['', [Validators.required, validDate]],
    expirationDate: ['', validDate],
    active: [true],
  });

  constructor() {
    effect(() => {
      const lot = this.lot();
      this.form.reset({
        productId: lot?.productId ?? 0,
        batchNumber: lot?.batchNumber ?? '',
        quantity: lot?.quantity ?? 0,
        entryDate: lot?.entryDate ?? '',
        expirationDate: lot?.expirationDate ?? '',
        active: lot?.active ?? true,
      });
    });
    effect(() => {
      const products = this.products();
      this.form.controls.productId.setValidators([
        Validators.required,
        Validators.min(1),
        (control) =>
          products.some((product) => product.id === control.value) ? null : { product: true },
      ]);
      this.form.controls.productId.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.lotSaved.emit(
      new Lot(
        this.lot()?.id ?? 0,
        value.productId,
        value.batchNumber.trim(),
        value.quantity,
        value.expirationDate || null,
        value.entryDate,
        value.active,
      ),
    );
  }
}
