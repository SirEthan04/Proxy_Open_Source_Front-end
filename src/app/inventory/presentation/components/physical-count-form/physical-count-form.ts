import { TranslatePipe } from '@ngx-translate/core';
import { Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-physical-count-form',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>{{ 'counts.productLot' | translate }}</mat-label>
        <mat-select formControlName="lotId" required>
          @for (lot of lots(); track lot.id) {
            <mat-option [value]="lot.id">{{ lotLabel(lot) }}</mat-option>
          }
        </mat-select>
        @if (form.controls.lotId.hasError('required')) {
          <mat-error>{{ 'movements.selectLot' | translate }}</mat-error>
        }
      </mat-form-field>
      @if (selectedLot(); as lot) {
        <div class="quantity-summary" aria-live="polite">
          <span
            >{{ 'counts.systemQuantity' | translate }} <strong>{{ lot.quantity }}</strong></span
          >
          <span
            >{{ 'counts.difference' | translate }}
            <strong [class.positive]="difference() > 0" [class.negative]="difference() < 0"
              >{{ difference() > 0 ? '+' : '' }}{{ difference() }}</strong
            ></span
          >
        </div>
      }
      <mat-form-field appearance="outline">
        <mat-label>{{ 'counts.physicalQuantity' | translate }}</mat-label>
        <input
          matInput
          type="number"
          min="0"
          step="1"
          formControlName="physicalQuantity"
          required
        />
        @if (form.controls.physicalQuantity.hasError('required')) {
          <mat-error>{{ 'counts.quantityRequired' | translate }}</mat-error>
        }
        @if (
          form.controls.physicalQuantity.hasError('min') ||
          form.controls.physicalQuantity.hasError('pattern')
        ) {
          <mat-error>{{ 'counts.quantityInvalid' | translate }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'common.date' | translate }}</mat-label>
        <input matInput type="date" formControlName="date" required />
        @if (form.controls.date.invalid && form.controls.date.touched) {
          <mat-error>{{ 'common.dateInvalid' | translate }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>{{ 'counts.observation' | translate }}</mat-label>
        <textarea matInput rows="3" maxlength="500" formControlName="observation"></textarea>
      </mat-form-field>
      <div class="form-actions">
        <button mat-flat-button type="submit" [disabled]="form.invalid">
          {{ 'counts.save' | translate }}
        </button>
      </div>
    </form>
  `,
  styles: `
    form {
      display: grid;
      gap: 8px;
      padding-top: 8px;
    }
    mat-form-field {
      width: 100%;
    }
    .quantity-summary {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      margin: 0 0 8px;
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .quantity-summary span {
      display: flex;
      gap: 8px;
    }
    .positive {
      color: #216e39;
    }
    .negative {
      color: #a12822;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class PhysicalCountForm {
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly countSaved = output<PhysicalCount>();
  readonly form = new FormGroup({
    lotId: new FormControl<number | null>(null, Validators.required),
    physicalQuantity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
    date: new FormControl(this.today(), [
      Validators.required,
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
    ]),
    observation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
  private readonly selectedLotId = signal<number | null>(null);
  private readonly physicalQuantity = signal(0);
  readonly selectedLot = computed(
    () => this.lots().find((lot) => lot.id === this.selectedLotId()) ?? null,
  );
  readonly difference = computed(
    () => this.physicalQuantity() - (this.selectedLot()?.quantity ?? 0),
  );

  constructor() {
    this.form.controls.lotId.valueChanges.subscribe((value) => this.selectedLotId.set(value));
    this.form.controls.physicalQuantity.valueChanges.subscribe((value) =>
      this.physicalQuantity.set(value ?? 0),
    );
  }

  lotLabel(lot: Lot): string {
    return `${this.products().find((product) => product.id === lot.productId)?.name ?? 'Product unavailable'} — ${lot.batchNumber}`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const lot = this.lots().find((item) => item.id === value.lotId);
    if (!lot || value.physicalQuantity === null) return;
    this.countSaved.emit(
      new PhysicalCount(
        0,
        lot.id,
        0,
        lot.quantity,
        value.physicalQuantity,
        value.physicalQuantity - lot.quantity,
        value.date ?? '',
        value.observation.trim(),
      ),
    );
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
