import { TranslatePipe } from '@ngx-translate/core';
import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import {
  PhysicalCountDialog,
  PhysicalCountDialogData,
} from '../../components/physical-count-dialog/physical-count-dialog';
import { PhysicalCountList } from '../../components/physical-count-list/physical-count-list';

@Component({
  selector: 'app-physical-counts',
  imports: [TranslatePipe, PhysicalCountList, MatButtonModule, MatIconModule],
  templateUrl: './physical-counts.html',
  styleUrl: './physical-counts.css',
})
export class PhysicalCounts implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly iamStore = inject(IamStore);
  private readonly dialog = inject(MatDialog);
  readonly counts = this.inventoryStore.physicalCounts;
  readonly lots = this.inventoryStore.lots;
  readonly products = this.inventoryStore.products;
  readonly users = this.inventoryStore.users;
  readonly loading = this.inventoryStore.physicalCountsLoading;
  readonly error = this.inventoryStore.physicalCountsError;
  readonly totalCounts = computed(() => this.counts().length);
  readonly shortages = computed(() => this.counts().filter((count) => count.difference < 0).length);
  readonly matches = computed(() => this.counts().filter((count) => count.difference === 0).length);

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadLots();
    this.inventoryStore.loadUsers();
    this.reload();
  }

  reload(): void {
    this.inventoryStore.loadPhysicalCounts();
  }

  onCreate(): void {
    const data: PhysicalCountDialogData = {
      lots: this.lots().filter((lot) => lot.active),
      products: this.products(),
    };
    this.dialog
      .open<PhysicalCountDialog, PhysicalCountDialogData, PhysicalCount>(PhysicalCountDialog, {
        data,
        width: '560px',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .subscribe((count) => {
        const userId = this.iamStore.currentUser()?.id;
        if (!count || userId === undefined) return;
        this.inventoryStore.createPhysicalCount(
          new PhysicalCount(
            count.id,
            count.lotId,
            userId,
            count.systemQuantity,
            count.physicalQuantity,
            count.physicalQuantity - count.systemQuantity,
            count.date,
            count.observation,
          ),
        );
      });
  }
}
