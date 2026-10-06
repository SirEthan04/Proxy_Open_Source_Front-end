import { Component, computed, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStore } from '../../../application/inventory.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { PhysicalCountDialog, PhysicalCountDialogData } from '../../components/physical-count-dialog/physical-count-dialog';
import { PhysicalCountList } from '../../components/physical-count-list/physical-count-list';

@Component({
  selector: 'app-physical-counts',
  imports: [PhysicalCountList, MatButtonModule, MatIconModule],
<<<<<<< HEAD
  templateUrl: './physical-counts.html',
  styleUrl: './physical-counts.css',
=======
  template: `
    <div class="counts-page">
      <header class="counts-header">
        <div><h1>Physical Counts</h1><p>Compare recorded inventory with the quantities found during a physical review.</p></div>
        <button mat-flat-button type="button" (click)="onCreate()"><mat-icon>add</mat-icon>Record count</button>
      </header>
      <div class="summary-grid">
        <div class="summary-card"><div class="summary-icon"><mat-icon>fact_check</mat-icon></div><div class="summary-content"><span>Total counts</span><strong>{{ totalCounts() }}</strong></div></div>
        <div class="summary-card"><div class="summary-icon"><mat-icon>warning</mat-icon></div><div class="summary-content"><span>Discrepancies</span><strong>{{ discrepancies() }}</strong></div></div>
        <div class="summary-card"><div class="summary-icon"><mat-icon>task_alt</mat-icon></div><div class="summary-content"><span>Matches</span><strong>{{ matches() }}</strong></div></div>
      </div>
      @if (error()) { <div class="error-state"><p role="alert">{{ error() }}</p><button mat-button type="button" (click)="reload()">Reload physical counts</button></div> }
      @if (loading()) { <p role="status">Loading physical counts...</p> } @else {
        <app-physical-count-list [counts]="counts()" [lots]="lots()" [products]="products()" [users]="users()" />
      }
    </div>
  `,
  styles: `
    .counts-page{padding:24px;min-height:100%;background:#f8f9fa}.counts-page>*{max-width:1400px;margin-left:auto;margin-right:auto}.counts-header{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:24px}.counts-header h1{margin:0}.counts-header p{margin:6px 0 0;color:#555}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}.summary-card{display:flex;align-items:center;gap:16px;padding:20px;background:white;border:1px solid #e5e7eb;border-radius:12px}.summary-icon{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:10px;background:#f3f4f6}.summary-icon mat-icon{color:#374151}.summary-content{display:flex;flex-direction:column;gap:4px}.summary-content span{font-size:13px;color:#555}.summary-content strong{font-size:24px;font-weight:600}.error-state{display:flex;flex-wrap:wrap;align-items:center;gap:16px;color:#9b1c1c}@media(max-width:768px){.summary-grid{grid-template-columns:1fr}.counts-page{padding:16px}}@media(max-width:600px){.counts-header{flex-direction:column;align-items:stretch}}
  `,
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
})
export class PhysicalCounts implements OnInit {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly iamStore = inject(IamStore);
  private readonly dialog = inject(MatDialog);
  readonly counts = this.inventoryStore.physicalCounts;
  readonly lots = this.inventoryStore.lots;
  readonly products = this.inventoryStore.products;
<<<<<<< HEAD
  readonly users = this.inventoryStore.users;
  readonly loading = this.inventoryStore.physicalCountsLoading;
  readonly error = this.inventoryStore.physicalCountsError;
  readonly totalCounts = computed(() => this.counts().length);
  readonly shortages = computed(() => this.counts().filter((count) => count.difference < 0).length);
=======
  readonly users = computed(() => {
    const user = this.iamStore.currentUser();
    return user ? [user] : [];
  });
  readonly loading = this.inventoryStore.physicalCountsLoading;
  readonly error = this.inventoryStore.physicalCountsError;
  readonly totalCounts = computed(() => this.counts().length);
  readonly discrepancies = computed(() => this.counts().filter((count) => count.difference !== 0).length);
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
  readonly matches = computed(() => this.counts().filter((count) => count.difference === 0).length);

  ngOnInit(): void {
    this.inventoryStore.loadProducts();
    this.inventoryStore.loadLots();
<<<<<<< HEAD
    this.inventoryStore.loadUsers();
=======
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
    this.reload();
  }

  reload(): void { this.inventoryStore.loadPhysicalCounts(); }

  onCreate(): void {
<<<<<<< HEAD
    const data: PhysicalCountDialogData = { lots: this.lots().filter((lot) => lot.active), products: this.products() };
    this.dialog.open<PhysicalCountDialog, PhysicalCountDialogData, PhysicalCount>(PhysicalCountDialog, {
      data, width: '560px', maxWidth: 'calc(100vw - 32px)',
    }).afterClosed().subscribe((count) => {
      const userId = this.iamStore.currentUser()?.id;
      if (!count || userId === undefined) return;
      this.inventoryStore.createPhysicalCount(new PhysicalCount(count.id, count.lotId, userId, count.systemQuantity,
        count.physicalQuantity, count.physicalQuantity - count.systemQuantity, count.date, count.observation));
=======
    const data: PhysicalCountDialogData = { lots: this.lots(), products: this.products() };
    this.dialog.open<PhysicalCountDialog, PhysicalCountDialogData, PhysicalCount>(PhysicalCountDialog, {
      data, width: '560px', maxWidth: 'calc(100vw - 32px)',
    }).afterClosed().subscribe((count) => {
      if (!count) return;
      const userId = this.iamStore.currentUser()?.id ?? 0;
      this.inventoryStore.createPhysicalCount(new PhysicalCount(count.id, count.lotId, userId, count.systemQuantity, count.physicalQuantity, count.date, count.observation));
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
    });
  }
}
