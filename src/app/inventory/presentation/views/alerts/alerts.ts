import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { InventoryStore } from '../../../application/inventory.store';
import { Alert } from '../../../domain/model/alert.entity';

@Component({
  selector: 'app-alerts',
  imports: [DatePipe, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule],
  template: `
    <main class="alerts-page">
      <header class="page-header"><div><h1>Inventory alerts</h1><p>Review stock and expiration conditions detected in your inventory.</p></div><button mat-stroked-button type="button" (click)="reload()"><mat-icon>refresh</mat-icon> Refresh</button></header>
      <section class="summary-grid" aria-label="Alert summary">
        <article class="summary-card"><mat-icon>notifications</mat-icon><div><span>Total alerts</span><strong>{{ alerts().length }}</strong></div></article>
        <article class="summary-card"><mat-icon>pending_actions</mat-icon><div><span>Pending</span><strong>{{ pendingAlerts() }}</strong></div></article>
        <article class="summary-card"><mat-icon>task_alt</mat-icon><div><span>Attended</span><strong>{{ attendedAlerts() }}</strong></div></article>
        <article class="summary-card critical"><mat-icon>error</mat-icon><div><span>Critical</span><strong>{{ criticalAlerts() }}</strong></div></article>
      </section>
      @if (error()) { <div class="error-state"><p role="alert">{{ error() }}</p><button mat-button type="button" (click)="reload()">Try again</button></div> }
      <section class="panel" aria-label="Inventory alerts">
        <div class="filters">
          <mat-form-field appearance="outline" class="search"><mat-label>Search alerts</mat-label><mat-icon matPrefix>search</mat-icon><input matInput type="search" placeholder="Product, lot or message" [value]="searchTerm()" (input)="onSearch($event)" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Type</mat-label><mat-select [value]="typeFilter()" (selectionChange)="typeFilter.set($event.value)"><mat-option value="all">All types</mat-option><mat-option value="LOW_STOCK">Low stock</mat-option><mat-option value="EXPIRED">Expired</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Level</mat-label><mat-select [value]="levelFilter()" (selectionChange)="levelFilter.set($event.value)"><mat-option value="all">All levels</mat-option><mat-option value="WARNING">Warning</mat-option><mat-option value="CRITICAL">Critical</mat-option></mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select [value]="statusFilter()" (selectionChange)="statusFilter.set($event.value)"><mat-option value="all">All statuses</mat-option><mat-option value="pending">Pending</mat-option><mat-option value="attended">Attended</mat-option></mat-select></mat-form-field>
        </div>
        @if (loading()) { <p class="state" role="status">Loading alerts…</p> }
        @else if (filtered().length === 0) { <div class="empty" role="status"><mat-icon>notifications_none</mat-icon><p>{{ alerts().length ? 'No alerts match these filters.' : 'No inventory alerts at this time.' }}</p></div> }
        @else {
          <div class="table-wrap" role="region" aria-label="Alerts table" tabindex="0"><table mat-table [dataSource]="pageAlerts()" aria-label="Inventory alerts">
            <ng-container matColumnDef="alert"><th mat-header-cell *matHeaderCellDef>Alert</th><td mat-cell *matCellDef="let alert"><strong>{{ typeName(alert) }}</strong><span class="message">{{ alert.message }}</span></td></ng-container>
            <ng-container matColumnDef="related"><th mat-header-cell *matHeaderCellDef>Product / lot</th><td mat-cell *matCellDef="let alert"><strong>{{ productName(alert.productId) }}</strong>@if (alert.lotId !== null) {<span class="message">{{ lotName(alert.lotId) }}</span>}</td></ng-container>
            <ng-container matColumnDef="level"><th mat-header-cell *matHeaderCellDef>Level</th><td mat-cell *matCellDef="let alert"><span class="chip" [class.warning]="alert.level === 'WARNING'" [class.critical]="alert.level === 'CRITICAL'">{{ alert.level === 'WARNING' ? 'Warning' : 'Critical' }}</span></td></ng-container>
            <ng-container matColumnDef="generated"><th mat-header-cell *matHeaderCellDef>Generated</th><td mat-cell *matCellDef="let alert">{{ alert.generatedAt | date:'medium' }}</td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let alert"><span class="chip" [class.pending]="!alert.attended" [class.attended]="alert.attended">{{ alert.attended ? 'Attended' : 'Pending' }}</span></td></ng-container>
            <ng-container matColumnDef="action"><th mat-header-cell *matHeaderCellDef>Action</th><td mat-cell *matCellDef="let alert">@if (!alert.attended) {<button mat-button type="button" [attr.aria-label]="'Mark alert for ' + productName(alert.productId) + ' as attended'" (click)="attend(alert)"><mat-icon>check</mat-icon> Attend</button>}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table></div>
          <mat-paginator aria-label="Alert pagination" [length]="filtered().length" [pageIndex]="pageIndex()" [pageSize]="pageSize()" [pageSizeOptions]="[5, 10, 25]" [showFirstLastButtons]="true" (page)="onPage($event)" />
        }
      </section>
    </main>
  `,
  styles: `
    .alerts-page{padding:24px;min-height:100%;background:#f8f9fa}.alerts-page>*{max-width:1400px;margin-left:auto;margin-right:auto}.page-header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}.page-header h1{margin:0}.page-header p{margin:6px 0 0;color:#595959}.page-header button{white-space:nowrap}.summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:24px}.summary-card{display:flex;align-items:center;gap:14px;padding:18px;background:#fff;border:1px solid #e5e7eb;border-radius:12px}.summary-card>mat-icon{color:#374151;background:#f3f4f6;padding:12px;border-radius:10px;box-sizing:content-box}.summary-card div{display:flex;flex-direction:column;gap:4px}.summary-card span{font-size:13px;color:#595959}.summary-card strong{font-size:24px}.summary-card.critical>mat-icon{color:#a12822;background:#fff1f0}.panel{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.filters{display:flex;gap:12px;padding:20px 20px 4px}.filters mat-form-field{width:170px}.filters .search{flex:1;max-width:400px}.table-wrap{overflow-x:auto}.table-wrap:focus-visible{outline:2px solid #374151;outline-offset:-2px}table{width:100%;min-width:900px}th{font-weight:600;color:#374151}td,th{padding:12px 18px}td strong,td .message{display:block}.message{font-size:12px;color:#595959;margin-top:4px}.chip{display:inline-block;padding:5px 10px;border-radius:16px;font-size:12px;font-weight:600;background:#f3f4f6;color:#374151}.chip.warning,.chip.pending{background:#fff7e6;color:#8a4b08}.chip.critical{background:#fff1f0;color:#a12822}.chip.attended{background:#e8f5e9;color:#216e39}.empty,.state{padding:44px;text-align:center;color:#595959}.empty mat-icon{font-size:42px;width:42px;height:42px}.error-state{display:flex;align-items:center;gap:12px;color:#9b1c1c;margin-bottom:16px}mat-paginator{border-top:1px solid #e5e7eb}@media(max-width:900px){.summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{flex-wrap:wrap}.filters .search{flex-basis:100%;max-width:none}.filters mat-form-field{flex:1;min-width:150px}}@media(max-width:600px){.alerts-page{padding:16px}.page-header{align-items:flex-start;flex-direction:column}.summary-grid{grid-template-columns:1fr}.filters{flex-direction:column}.filters mat-form-field,.filters .search{width:100%;max-width:none}}
  `,
})
export class Alerts implements OnInit {
  private readonly store = inject(InventoryStore);
  readonly alerts = this.store.alerts;
  readonly products = this.store.products;
  readonly lots = this.store.lots;
  readonly loading = this.store.alertsLoading;
  readonly error = this.store.alertsError;
  readonly searchTerm = signal('');
  readonly typeFilter = signal('all');
  readonly levelFilter = signal('all');
  readonly statusFilter = signal('all');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly columns = ['alert', 'related', 'level', 'generated', 'status', 'action'];
  readonly pendingAlerts = computed(() => this.alerts().filter((alert) => !alert.attended).length);
  readonly attendedAlerts = computed(() => this.alerts().filter((alert) => alert.attended).length);
  readonly criticalAlerts = computed(() => this.alerts().filter((alert) => alert.level === 'CRITICAL').length);
  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.alerts().filter((alert) => {
      const text = `${alert.message} ${this.productName(alert.productId)} ${this.lotName(alert.lotId)}`.toLowerCase();
      return (!term || text.includes(term)) && (this.typeFilter() === 'all' || alert.type === this.typeFilter()) && (this.levelFilter() === 'all' || alert.level === this.levelFilter()) && (this.statusFilter() === 'all' || (this.statusFilter() === 'attended') === alert.attended);
    });
  });
  readonly pageAlerts = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));

  ngOnInit(): void { this.reload(); }
  reload(): void { this.store.loadAlerts(); }
  attend(alert: Alert): void { this.store.attendAlert(alert); }
  productName(id: number | null): string { return this.products().find((product) => product.id === id)?.name ?? 'Product unavailable'; }
  lotName(id: number | null): string { return this.lots().find((lot) => lot.id === id)?.batchNumber ?? 'Lot unavailable'; }
  typeName(alert: Alert): string { return alert.type === 'LOW_STOCK' ? 'Low stock' : 'Expired lot'; }
  onSearch(event: Event): void { if (event.target instanceof HTMLInputElement) { this.searchTerm.set(event.target.value); this.pageIndex.set(0); } }
  onPage(event: PageEvent): void { this.pageSize.set(event.pageSize); this.pageIndex.set(event.pageIndex); }
}
