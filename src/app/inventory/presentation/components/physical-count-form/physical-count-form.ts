import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

export interface PhysicalCountValues {
  lotId: number;
  systemQuantity: number;
  physicalQuantity: number;
  date: string;
  observation: string;
}

const validDate: ValidatorFn = (control) => {
  const value: unknown = control.value;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? null
    : { date: true };
};
const finiteQuantity: ValidatorFn = (control) =>
  typeof control.value === 'number' && Number.isFinite(control.value) ? null : { quantity: true };

@Component({
  selector: 'app-physical-count-form',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './physical-count-form.html',
  styles: `
    :host {
      display: block;
    }
    form {
      display: grid;
      gap: 4px;
    }
    .quantities {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin: 0 0 20px;
    }
    .quantities div {
      display: grid;
      gap: 4px;
    }
    .quantities dt {
      font-size: 14px;
    }
    .quantities dd {
      margin: 0;
      font-weight: 600;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class PhysicalCountForm {
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly saving = input(false);
  readonly countSaved = output<PhysicalCountValues>();
  readonly form = this.fb.nonNullable.group({
    lotId: [0, [Validators.required, Validators.min(1)]],
    physicalQuantity: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      finiteQuantity,
    ]),
    date: ['', [Validators.required, validDate]],
    observation: [''],
  });
  private readonly lotId = toSignal(this.form.controls.lotId.valueChanges, { initialValue: 0 });
  private readonly physicalQuantity = toSignal(this.form.controls.physicalQuantity.valueChanges, {
    initialValue: null,
  });
  readonly selectedLot = computed(() => this.lots().find((lot) => lot.id === this.lotId()) ?? null);
  readonly difference = computed(() => {
    const lot = this.selectedLot();
    const quantity = this.physicalQuantity();
    return lot && quantity !== null && Number.isFinite(quantity) && quantity >= 0
      ? quantity - lot.quantity
      : null;
  });

  constructor() {
    effect(() => {
      const lots = this.lots();
      this.form.controls.lotId.setValidators([
        Validators.required,
        Validators.min(1),
        (control) => (lots.some((lot) => lot.id === control.value) ? null : { lot: true }),
      ]);
      this.form.controls.lotId.updateValueAndValidity();
    });
    effect(() => {
      if (this.saving()) this.form.disable({ emitEvent: false });
      else this.form.enable({ emitEvent: false });
    });
  }

  lotLabel(lot: Lot): string {
    return `${this.products().find((product) => product.id === lot.productId)?.name ?? this.translate.instant('common.productUnavailable')} — ${lot.batchNumber}`;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    const lot = this.selectedLot();
    const value = this.form.getRawValue();
    if (this.form.invalid || this.saving() || !lot || value.physicalQuantity === null) return;
    this.countSaved.emit({
      ...value,
      physicalQuantity: value.physicalQuantity,
      systemQuantity: lot.quantity,
      observation: value.observation.trim(),
    });
  }
}
