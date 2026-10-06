import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { InventoryMovement } from '../../../domain/model/inventory-movement.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { MovementForm } from '../movement-form/movement-form';

export interface MovementDialogData { lots: Lot[]; products: Product[]; }

@Component({
  selector: 'app-movement-dialog',
  imports: [MatDialogModule, MatButtonModule, MovementForm],
  template: `
    <h2 mat-dialog-title>Record inventory movement</h2>
    <mat-dialog-content>
      <app-movement-form [lots]="data.lots" [products]="data.products" (movementSaved)="onSaved($event)" />
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button type="button" (click)="onCancel()">Cancel</button></mat-dialog-actions>
  `,
  styles: `mat-dialog-content { padding-top: 8px; }`,
})
export class MovementDialog {
  readonly data = inject<MovementDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<MovementDialog, InventoryMovement>>(MatDialogRef);
  onSaved(movement: InventoryMovement): void { this.dialogRef.close(movement); }
  onCancel(): void { this.dialogRef.close(); }
}
