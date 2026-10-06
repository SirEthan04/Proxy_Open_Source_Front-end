import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { PhysicalCountForm } from '../physical-count-form/physical-count-form';

<<<<<<< HEAD
export interface PhysicalCountDialogData { lots: Lot[]; products: Product[]; }
=======
export interface PhysicalCountDialogData {
  lots: Lot[];
  products: Product[];
}
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7

@Component({
  selector: 'app-physical-count-dialog',
  imports: [MatDialogModule, MatButtonModule, PhysicalCountForm],
  template: `
<<<<<<< HEAD
    <h2 mat-dialog-title>Register physical count</h2>
    <mat-dialog-content><app-physical-count-form [lots]="data.lots" [products]="data.products" (countSaved)="onSaved($event)" /></mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button type="button" (click)="onCancel()">Cancel</button></mat-dialog-actions>
  `,
  styles: `mat-dialog-content{padding-top:8px}`,
=======
    <h2 mat-dialog-title>Record physical count</h2>
    <mat-dialog-content>
      <app-physical-count-form [lots]="data.lots" [products]="data.products" (countSaved)="onSaved($event)" />
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button type="button" (click)="onCancel()">Cancel</button></mat-dialog-actions>
  `,
  styles: `mat-dialog-content { padding-top: 8px; }`,
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
})
export class PhysicalCountDialog {
  readonly data = inject<PhysicalCountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<PhysicalCountDialog, PhysicalCount>>(MatDialogRef);
<<<<<<< HEAD
=======

>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
  onSaved(count: PhysicalCount): void { this.dialogRef.close(count); }
  onCancel(): void { this.dialogRef.close(); }
}
