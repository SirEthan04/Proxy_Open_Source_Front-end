<<<<<<< HEAD
import { Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
=======
import { Component, computed, effect, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-physical-count-form',
<<<<<<< HEAD
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
=======
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="count-form">
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
      <mat-form-field appearance="outline">
        <mat-label>Product and lot</mat-label>
        <mat-select formControlName="lotId" required>
          @for (lot of lots(); track lot.id) {
<<<<<<< HEAD
            <mat-option [value]="lot.id">{{ lotLabel(lot) }}</mat-option>
          }
        </mat-select>
        @if (form.controls.lotId.hasError('required')) { <mat-error>Select a lot.</mat-error> }
      </mat-form-field>
      @if (selectedLot(); as lot) {
        <div class="quantity-summary" aria-live="polite">
          <span>System quantity <strong>{{ lot.quantity }}</strong></span>
          <span>Difference <strong [class.positive]="difference() > 0" [class.negative]="difference() < 0">{{ difference() > 0 ? '+' : '' }}{{ difference() }}</strong></span>
        </div>
      }
      <mat-form-field appearance="outline">
        <mat-label>Physical quantity found</mat-label>
        <input matInput type="number" min="0" step="1" formControlName="physicalQuantity" required />
        @if (form.controls.physicalQuantity.hasError('required')) { <mat-error>Enter the quantity found.</mat-error> }
        @if (form.controls.physicalQuantity.hasError('min') || form.controls.physicalQuantity.hasError('pattern')) { <mat-error>Quantity must be a non-negative whole number.</mat-error> }
      </mat-form-field>
=======
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
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
        @if (form.controls.date.invalid && form.controls.date.touched) { <mat-error>Enter a valid date.</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
<<<<<<< HEAD
        <mat-label>Observation (optional)</mat-label>
        <textarea matInput rows="3" maxlength="500" formControlName="observation"></textarea>
      </mat-form-field>
      <div class="form-actions"><button mat-flat-button type="submit" [disabled]="form.invalid">Save count</button></div>
    </form>
  `,
  styles: `
    form{display:grid;gap:8px;padding-top:8px}mat-form-field{width:100%}.quantity-summary{display:flex;justify-content:space-between;gap:16px;padding:14px 16px;margin:0 0 8px;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:8px}.quantity-summary span{display:flex;gap:8px}.positive{color:#216e39}.negative{color:#a12822}.form-actions{display:flex;justify-content:flex-end}
  `,
})
export class PhysicalCountForm {
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly countSaved = output<PhysicalCount>();
  readonly form = new FormGroup({
    lotId: new FormControl<number | null>(null, Validators.required),
    physicalQuantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    date: new FormControl(this.today(), [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
    observation: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });
  private readonly selectedLotId = signal<number | null>(null);
  private readonly physicalQuantity = signal(0);
  readonly selectedLot = computed(() => this.lots().find((lot) => lot.id === this.selectedLotId()) ?? null);
  readonly difference = computed(() => this.physicalQuantity() - (this.selectedLot()?.quantity ?? 0));

  constructor() {
    this.form.controls.lotId.valueChanges.subscribe((value) => this.selectedLotId.set(value));
    this.form.controls.physicalQuantity.valueChanges.subscribe((value) => this.physicalQuantity.set(value ?? 0));
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
    this.countSaved.emit(new PhysicalCount(0, lot.id, 0, lot.quantity, value.physicalQuantity,
      value.physicalQuantity - lot.quantity, value.date ?? '', value.observation.trim()));
  }

  private today(): string { return new Date().toISOString().slice(0, 10); }
=======
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
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
}
