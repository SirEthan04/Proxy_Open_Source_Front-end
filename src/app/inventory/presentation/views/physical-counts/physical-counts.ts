import { TranslatePipe } from '@ngx-translate/core';
import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { PhysicalCountList } from '../../components/physical-count-list/physical-count-list';
import {
  PhysicalCountDialog,
  PhysicalCountDialogData,
} from '../../components/physical-count-dialog/physical-count-dialog';

@Component({
  selector: 'app-physical-counts',
  imports: [TranslatePipe, PhysicalCountList, MatButtonModule, MatIconModule],
  templateUrl: './physical-counts.html',
  styleUrl: './physical-counts.css',
})
export class PhysicalCounts implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly dialog = inject(MatDialog);
  readonly currentUser = inject(IamStore).currentUser;
  readonly counts = this.store.physicalCounts;
  readonly lots = this.store.lots;
  readonly products = this.store.products;
  readonly loading = this.store.physicalCountsLoading;
  readonly error = this.store.physicalCountsError;
  readonly matches = computed(() => this.counts().filter((count) => count.difference === 0).length);
  readonly discrepancies = computed(
    () => this.counts().filter((count) => count.difference !== 0).length,
  );

  ngOnInit(): void {
    this.reload();
  }
  reload(): void {
    this.store.loadPhysicalCounts();
  }
  onCreate(): void {
    if (this.loading() || this.error() || !this.currentUser()) return;
    this.dialog.open<PhysicalCountDialog, PhysicalCountDialogData>(PhysicalCountDialog, {
      data: { lots: this.lots(), products: this.products() },
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }
}
