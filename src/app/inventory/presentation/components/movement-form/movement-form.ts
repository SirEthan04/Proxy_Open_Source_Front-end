import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { InventoryMovement, InventoryMovementType } from '../../../domain/model/inventory-movement.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-movement-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="movement-form">
      <mat-form-field appearance="outline">
        <mat-label>Lot</mat-label>
        <mat-select formControlName="lotId" required>
          @for (lot of lots(); track lot.id) {
            <mat-option [value]="lot.id">{{ getLotLabel(lot) }}</mat-option>
          }
        </mat-select>
        @if (form.controls.lotId.hasError('required')) { <mat-error>Select a lot.</mat-error> }
      </mat-form-field>
      @if (lots().length === 0) { <p role="status">No lots available. Register a lot first.</p> }
      <mat-form-field appearance="outline">
        <mat-label>Movement type</mat-label>
        <mat-select formControlName="type" required>
          <mat-option value="ENTRY">Entry</mat-option>
          <mat-option value="EXIT">Exit</mat-option>
          <mat-option value="ADJUSTMENT">Adjustment</mat-option>
        </mat-select>
        @if (form.controls.type.invalid && form.controls.type.touched) { <mat-error>Select a type.</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Quantity</mat-label>
        <input matInput type="number" min="0.01" step="any" formControlName="quantity" required />
        @if (form.controls.quantity.invalid && form.controls.quantity.touched) { <mat-error>Enter a quantity greater than 0.</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
        @if (form.controls.date.invalid && form.controls.date.touched) { <mat-error>Enter a valid date.</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Reason</mat-label>
        <textarea matInput rows="3" formControlName="reason"></textarea>
      </mat-form-field>
      <div class="form-actions"><button mat-flat-button type="submit" [disabled]="form.invalid || lots().length === 0">Record movement</button></div>
    </form>
  `,
  styles: `:host { display: block; } .movement-form { display: grid; gap: 4px; } .form-actions { display: flex; justify-content: flex-end; }`,
})
export class MovementForm {
  private readonly formBuilder = inject(FormBuilder);
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly movementSaved = output<InventoryMovement>();
  readonly form = this.formBuilder.nonNullable.group({
    lotId: [0, [Validators.required, Validators.min(1)]],
    type: ['ENTRY' as InventoryMovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(Number.MIN_VALUE)]],
    date: ['', [Validators.required, (control: { value: unknown }) => {
      const value = control.value;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: true };
      const parsed = new Date(`${value}T00:00:00Z`);
      return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? null : { date: true };
    }]],
    reason: [''],
  });

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
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.movementSaved.emit(new InventoryMovement(0, value.lotId, 0, value.type, value.quantity, value.date, value.reason.trim()));
  }
}
