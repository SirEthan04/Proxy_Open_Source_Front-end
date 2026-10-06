import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InventoryMovement, MovementType } from '../../../domain/model/inventory-movement.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

export interface MovementDialogData { lots: Lot[]; products: Product[]; }

@Component({
  selector: 'app-movement-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Registrar movimiento</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="form-content">
        <mat-form-field appearance="outline"><mat-label>Lote</mat-label>
          <mat-select formControlName="lotId" required>
            @for (lot of data.lots; track lot.id) {
              <mat-option [value]="lot.id">{{ productName(lot.productId) }} — {{ lot.batchNumber || ('Lote ' + lot.id) }}</mat-option>
            }
          </mat-select>
          @if (form.controls.lotId.hasError('required')) { <mat-error>Selecciona un lote.</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Tipo</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="ENTRY">Entrada</mat-option><mat-option value="EXIT">Salida</mat-option><mat-option value="ADJUSTMENT">Ajuste</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Cantidad</mat-label><input matInput type="number" min="0.01" step="any" formControlName="quantity" required>
          @if (form.controls.quantity.hasError('min')) { <mat-error>La cantidad debe ser mayor que 0.</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Fecha</mat-label><input matInput type="date" formControlName="date" required></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Motivo</mat-label><textarea matInput rows="3" formControlName="reason"></textarea></mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end"><button mat-button type="button" (click)="cancel()">Cancelar</button><button mat-flat-button type="submit" [disabled]="form.invalid">Guardar movimiento</button></mat-dialog-actions>
    </form>
  `,
  styles: [`.form-content { display: grid; gap: 8px; min-width: min(420px, 80vw); padding-top: 8px; } mat-form-field { width: 100%; }`],
})
export class MovementDialog {
  readonly data = inject<MovementDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<MovementDialog>);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    lotId: [0, [Validators.required, Validators.min(1)]], type: ['ENTRY' as MovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.01)]], date: [new Date().toISOString().slice(0, 10), Validators.required], reason: [''],
  });
  productName(productId: number): string { return this.data.products.find(product => product.id === productId)?.name ?? `Producto ${productId}`; }
  save(): void {
    if (this.form.invalid) return;
    this.ref.close(new InventoryMovement(0, Number(this.form.controls.lotId.value), null, this.form.controls.type.value, Number(this.form.controls.quantity.value), this.form.controls.date.value, this.form.controls.reason.value.trim()));
  }
  cancel(): void { this.ref.close(); }
}
