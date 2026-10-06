import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { PhysicalCountForm } from '../physical-count-form/physical-count-form';

export interface PhysicalCountDialogData {
  lots: Lot[];
  products: Product[];
}

@Component({
  selector: 'app-physical-count-dialog',
  imports: [MatDialogModule, MatButtonModule, PhysicalCountForm],
  template: `
    <h2 mat-dialog-title>Record physical count</h2>
    <mat-dialog-content>
      <app-physical-count-form [lots]="data.lots" [products]="data.products" (countSaved)="onSaved($event)" />
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button type="button" (click)="onCancel()">Cancel</button></mat-dialog-actions>
  `,
  styles: `mat-dialog-content { padding-top: 8px; }`,
})
export class PhysicalCountDialog {
  readonly data = inject<PhysicalCountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<PhysicalCountDialog, PhysicalCount>>(MatDialogRef);

  onSaved(count: PhysicalCount): void { this.dialogRef.close(count); }
  onCancel(): void { this.dialogRef.close(); }
}
