import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { InventoryMovement } from '../../../domain/model/inventory-movement.entity';
import { MovementDialog, MovementDialogData } from '../../components/movement-dialog/movement-dialog';
import { MovementList } from '../../components/movement-list/movement-list';

@Component({
  selector: 'app-movements',
  imports: [MovementList, MatButtonModule, MatIconModule],
  template: `
    <div class="movements-page">
      <header class="movements-header">
        <div><h1>Movements</h1><p>Review the inventory movement history and record stock events.</p></div>
        <button mat-flat-button type="button" (click)="onCreate()"><mat-icon>add</mat-icon>Record movement</button>
      </header>
      <div class="summary-grid">
        <div class="summary-card"><div class="summary-icon"><mat-icon>swap_horiz</mat-icon></div><div class="summary-content"><span>Total movements</span><strong>{{ totalMovements() }}</strong></div></div>
        <div class="summary-card"><div class="summary-icon"><mat-icon>south</mat-icon></div><div class="summary-content"><span>Entries</span><strong>{{ entries() }}</strong></div></div>
        <div class="summary-card"><div class="summary-icon"><mat-icon>north</mat-icon></div><div class="summary-content"><span>Exits</span><strong>{{ exits() }}</strong></div></div>
      </div>
      @if (error()) { <div class="error-state"><p role="alert">{{ error() }}</p><button mat-button type="button" (click)="reload()">Reload movements</button></div> }
      @if (loading()) { <p role="status">Loading movements...</p> } @else {
        <app-movement-list [movements]="movements()" [lots]="lots()" [products]="products()" />
      }
    </div>
  `,
  styles: `
    .movements-page{padding:24px;min-height:100%;background:#f8f9fa}.movements-page>*{max-width:1400px;margin-left:auto;margin-right:auto}.movements-header{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:24px}.movements-header h1{margin:0}.movements-header p{margin:6px 0 0;color:#666}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}.summary-card{display:flex;align-items:center;gap:16px;padding:20px;background:white;border:1px solid #e5e7eb;border-radius:12px}.summary-icon{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:10px;background:#f3f4f6}.summary-icon mat-icon{color:#374151}.summary-content{display:flex;flex-direction:column;gap:4px}.summary-content span{font-size:13px;color:#6b7280}.summary-content strong{font-size:24px;font-weight:600}.error-state{display:flex;flex-wrap:wrap;align-items:center;gap:16px;color:#9b1c1c}@media(max-width:768px){.summary-grid{grid-template-columns:1fr}.movements-page{padding:16px}}@media(max-width:600px){.movements-header{flex-direction:column;align-items:stretch}}
  `,
})
export class Movements implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly iamStore = inject(IamStore);
  private readonly dialog = inject(MatDialog);
  readonly movements = this.inventoryStore.movements;
  readonly lots = this.inventoryStore.lots;
  readonly products = this.inventoryStore.products;
  readonly loading = this.inventoryStore.movementsLoading;
  readonly error = this.inventoryStore.movementsError;
  readonly totalMovements = computed(() => this.movements().length);
  readonly entries = computed(() => this.movements().filter((movement) => movement.type === 'ENTRY').length);
  readonly exits = computed(() => this.movements().filter((movement) => movement.type === 'EXIT').length);

  ngOnInit(): void { this.inventoryStore.loadProducts(); this.inventoryStore.loadLots(); this.reload(); }
  reload(): void { this.inventoryStore.loadMovements(); }
  onCreate(): void {
    const data: MovementDialogData = { lots: this.lots(), products: this.products() };
    this.dialog.open<MovementDialog, MovementDialogData, InventoryMovement>(MovementDialog, {
      data, width: '560px', maxWidth: 'calc(100vw - 32px)',
    }).afterClosed().subscribe((movement) => {
      if (!movement) return;
      const userId = this.iamStore.currentUser()?.id ?? 0;
      this.inventoryStore.createMovement(new InventoryMovement(movement.id, movement.lotId, userId, movement.type, movement.quantity, movement.date, movement.reason));
    });
  }
}
