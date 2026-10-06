import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { LotForm } from '../lot-form/lot-form';

export interface LotDialogData {
  lot: Lot | null;
  products: Product[];
}

@Component({
  selector: 'app-lot-dialog',
  imports: [TranslatePipe, MatDialogModule, MatButtonModule, LotForm],
  template: `
    <h2 mat-dialog-title>{{ data.lot ? ('lots.edit' | translate) : ('lots.new' | translate) }}</h2>
    <mat-dialog-content>
      <app-lot-form [lot]="data.lot" [products]="data.products" (lotSaved)="onLotSaved($event)" />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      padding-top: 8px;
    }
  `,
})
export class LotDialog {
  readonly data = inject<LotDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<LotDialog, Lot>>(MatDialogRef);

  onLotSaved(lot: Lot): void {
    this.dialogRef.close(lot);
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
