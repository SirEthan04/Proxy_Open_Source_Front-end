import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { PhysicalCountForm, PhysicalCountValues } from '../physical-count-form/physical-count-form';

export interface PhysicalCountDialogData {
  lots: Lot[];
  products: Product[];
}

@Component({
  selector: 'app-physical-count-dialog',
  imports: [TranslatePipe, MatDialogModule, MatButtonModule, PhysicalCountForm],
  template: `
    <h2 mat-dialog-title>{{ 'physicalCounts.newCount' | translate }}</h2>
    <mat-dialog-content>
      @if (error()) {
        <p role="alert">{{ error()! | translate }}</p>
      }
      <app-physical-count-form
        [lots]="data.lots"
        [products]="data.products"
        [saving]="saving()"
        (countSaved)="onSave($event)"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end"
      ><button mat-button type="button" [disabled]="saving()" (click)="cancel()">
        {{ 'common.cancel' | translate }}
      </button></mat-dialog-actions
    >
  `,
  styles: `
    mat-dialog-content {
      padding-top: 8px;
    }
    [role='alert'] {
      color: var(--bodego-error);
    }
  `,
})
export class PhysicalCountDialog {
  readonly data = inject<PhysicalCountDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<PhysicalCountDialog>>(MatDialogRef);
  private readonly store = inject(InventoryStore);
  private readonly iam = inject(IamStore);
  readonly saving = this.store.physicalCountsSaving;
  readonly error = signal<string | null>(null);

  onSave(value: PhysicalCountValues): void {
    const user = this.iam.currentUser();
    if (!user) {
      this.error.set('physicalCounts.errors.session');
      return;
    }
    if (this.saving()) return;
    this.error.set(null);
    this.dialogRef.disableClose = true;
    this.store.createPhysicalCount(
      new PhysicalCount(
        0,
        value.lotId,
        user.id,
        value.systemQuantity,
        value.physicalQuantity,
        value.date,
        value.observation,
      ),
      () => this.dialogRef.close(),
      () => {
        this.dialogRef.disableClose = false;
        this.error.set('physicalCounts.errors.save');
      },
    );
  }

  cancel(): void {
    if (!this.saving()) this.dialogRef.close();
  }
}
