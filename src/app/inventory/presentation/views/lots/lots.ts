import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStore } from '../../../application/inventory.store';
import { Lot } from '../../../domain/model/lot.entity';
import { LotList } from '../../components/lot-list/lot-list';
import { LotDialog, LotDialogData } from '../../components/lot-dialog/lot-dialog';

@Component({
  selector: 'app-lots',
  imports: [TranslatePipe, LotList, MatButtonModule, MatIconModule],
  templateUrl: './lots.html',
  styleUrl: './lots.css',
})
export class Lots implements OnInit {
  readonly translate = inject(TranslateService);
  private readonly inventoryStore = inject(InventoryStore);
  private readonly dialog = inject(MatDialog);
  readonly lots = this.inventoryStore.lots;
  readonly products = this.inventoryStore.products;
  readonly loading = this.inventoryStore.lotsLoading;
  readonly error = this.inventoryStore.lotsError;
  readonly totalLots = computed(() => this.lots().length);
  readonly activeLots = computed(() => this.lots().filter((lot) => lot.active).length);
  readonly inactiveLots = computed(() => this.lots().filter((lot) => !lot.active).length);

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.reload();
  }

  reload(): void {
    this.inventoryStore.loadLots();
  }
  onCreate(): void {
    this.openLotDialog(null);
  }
  onEdit(lot: Lot): void {
    this.openLotDialog(lot);
  }

  onDelete(lot: Lot): void {
    if (confirm(this.translate.instant('lots.deleteConfirmation', { batch: lot.batchNumber }))) {
      this.inventoryStore.deleteLot(lot.id);
    }
  }

  private openLotDialog(lot: Lot | null): void {
    const data: LotDialogData = { lot, products: this.products() };
    const dialogRef = this.dialog.open<LotDialog, LotDialogData, Lot>(LotDialog, {
      data,
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result.id === 0) this.inventoryStore.createLot(result);
      else this.inventoryStore.updateLot(result);
    });
  }
}
