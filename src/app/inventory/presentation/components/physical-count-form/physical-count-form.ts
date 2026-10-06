import { Component, computed, effect, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-physical-count-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="count-form">
      <mat-form-field appearance="outline">
        <mat-label>Product and lot</mat-label>
        <mat-select formControlName="lotId" required>
          @for (lot of lots(); track lot.id) {
            <mat-option [value]="lot.id">{{ getLotLabel(lot) }}</mat-option>
          }
        </mat-select>
        @if (form.controls.lotId.hasError('required') && form.controls.lotId.touched) { <mat-error>Select a lot.</mat-error> }
      </mat-form-field>
      @if (lots().length === 0) { <p role="status">No lots available. Register a lot first.</p> }

      <div class="quantity-summary" aria-live="polite">
        <span>System quantity</span><strong>{{ selectedLot()?.quantity ?? 'Select a lot' }}</strong>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Physical quantity found</mat-label>
        <input matInput type="number" min="0" step="any" formControlName="physicalQuantity" required />
        @if (form.controls.physicalQuantity.invalid && form.controls.physicalQuantity.touched) { <mat-error>Enter a quantity greater than or equal to 0.</mat-error> }
      </mat-form-field>
      <div class="difference-summary" aria-live="polite">
        <span>Difference</span>
        @if (selectedLot()) {
          <strong [class.shortage]="difference() < 0" [class.surplus]="difference() > 0">{{ difference() > 0 ? '+' : '' }}{{ difference() }}</strong>
          <span class="status">{{ difference() === 0 ? 'Match' : difference() > 0 ? 'Surplus' : 'Shortage' }}</span>
        } @else { <strong>Select a lot</strong> }
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
        @if (form.controls.date.invalid && form.controls.date.touched) { <mat-error>Enter a valid date.</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Observation</mat-label>
        <textarea matInput rows="3" formControlName="observation" maxlength="500"></textarea>
      </mat-form-field>
      <div class="form-actions"><button mat-flat-button type="submit" [disabled]="form.invalid || !selectedLot()">Save physical count</button></div>
    </form>
  `,
  styles: `
    :host{display:block}.count-form{display:grid;gap:4px}.quantity-summary,.difference-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin-bottom:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f8f9fa}.quantity-summary span,.difference-summary span{color:#4b5563}.difference-summary strong{font-size:18px}.difference-summary .shortage{color:#a12822}.difference-summary .surplus{color:#216e39}.difference-summary .status{font-size:12px;font-weight:600}.form-actions{display:flex;justify-content:flex-end}
  `,
})
export class PhysicalCountForm {
  private readonly formBuilder = inject(FormBuilder);
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly countSaved = output<PhysicalCount>();
  readonly form = this.formBuilder.nonNullable.group({
    lotId: [0, [Validators.required, Validators.min(1)]],
    physicalQuantity: [0, [Validators.required, Validators.min(0)]],
    date: [this.today(), [Validators.required, (control: { value: unknown }) => {
      const value = control.value;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
      const parsed = new Date(`${value}T00:00:00Z`);
      return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? null : { date: true };
    }]],
    observation: [''],
  });
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly selectedLot = computed(() => this.lots().find((lot) => lot.id === this.formValue().lotId) ?? null);
  readonly difference = computed(() => (Number(this.formValue().physicalQuantity) || 0) - (this.selectedLot()?.quantity ?? 0));

  constructor() {
    effect(() => {
      const lots = this.lots();
      this.form.controls.lotId.setValidators([
        Validators.required,
        Validators.min(1),
        (control) => lots.some((lot) => lot.id === control.value) ? null : { lot: true },
      ]);
      this.form.controls.lotId.updateValueAndValidity();
    });
  }

  getLotLabel(lot: Lot): string {
    const productName = this.products().find((product) => product.id === lot.productId)?.name ?? 'Product unavailable';
    return `${productName} — ${lot.batchNumber}`;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    const lot = this.selectedLot();
    if (this.form.invalid || !lot) return;
    const value = this.form.getRawValue();
    this.countSaved.emit(new PhysicalCount(0, lot.id, 0, lot.quantity, value.physicalQuantity, value.date, value.observation.trim()));
  }

  private today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
