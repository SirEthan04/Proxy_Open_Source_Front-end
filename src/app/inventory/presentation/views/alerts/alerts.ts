import { TranslatePipe } from '@ngx-translate/core';
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
  imports: [
    TranslatePipe,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <main class="alerts-page">
      <header class="page-header">
        <div>
          <h1>{{ 'alerts.title' | translate }}</h1>
          <p>{{ 'alerts.description' | translate }}</p>
        </div>
        <button mat-stroked-button type="button" (click)="reload()">
          <mat-icon>refresh</mat-icon> {{ 'common.refresh' | translate }}
        </button>
      </header>
      <section class="summary-grid" aria-label="Alert summary">
        <article class="summary-card">
          <mat-icon>notifications</mat-icon>
          <div>
            <span>{{ 'alerts.total' | translate }}</span
            ><strong>{{ alerts().length }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <mat-icon>pending_actions</mat-icon>
          <div>
            <span>{{ 'alerts.pending' | translate }}</span
            ><strong>{{ pendingAlerts() }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <mat-icon>task_alt</mat-icon>
          <div>
            <span>{{ 'alerts.attended' | translate }}</span
            ><strong>{{ attendedAlerts() }}</strong>
          </div>
        </article>
        <article class="summary-card critical">
          <mat-icon>error</mat-icon>
          <div>
            <span>{{ 'alerts.critical' | translate }}</span
            ><strong>{{ criticalAlerts() }}</strong>
          </div>
        </article>
      </section>
      @if (error()) {
        <div class="error-state">
          <p role="alert">{{ error() }}</p>
          <button mat-button type="button" (click)="reload()">
            {{ 'common.retry' | translate }}
          </button>
        </div>
      }
      <section class="panel" [attr.aria-label]="'alerts.title' | translate">
        <div class="filters">
          <mat-form-field appearance="outline" class="search"
            ><mat-label>{{ 'alerts.search' | translate }}</mat-label
            ><mat-icon matPrefix>search</mat-icon
            ><input
              matInput
              type="search"
              placeholder="Product, lot or message"
              [value]="searchTerm()"
              (input)="onSearch($event)"
          /></mat-form-field>
          <mat-form-field appearance="outline"
            ><mat-label>{{ 'common.type' | translate }}</mat-label
            ><mat-select [value]="typeFilter()" (selectionChange)="typeFilter.set($event.value)"
              ><mat-option value="all">{{ 'common.allTypes' | translate }}</mat-option
              ><mat-option value="LOW_STOCK">{{ 'alerts.lowStock' | translate }}</mat-option
              ><mat-option value="EXPIRED">{{
                'alerts.expired' | translate
              }}</mat-option></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>{{ 'alerts.level' | translate }}</mat-label
            ><mat-select [value]="levelFilter()" (selectionChange)="levelFilter.set($event.value)"
              ><mat-option value="all">{{ 'alerts.allLevels' | translate }}</mat-option
              ><mat-option value="WARNING">{{ 'alerts.warning' | translate }}</mat-option
              ><mat-option value="CRITICAL">{{
                'alerts.critical' | translate
              }}</mat-option></mat-select
            ></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>{{ 'common.status' | translate }}</mat-label
            ><mat-select [value]="statusFilter()" (selectionChange)="statusFilter.set($event.value)"
              ><mat-option value="all">{{ 'common.allStatuses' | translate }}</mat-option
              ><mat-option value="pending">{{ 'alerts.pending' | translate }}</mat-option
              ><mat-option value="attended">{{
                'alerts.attended' | translate
              }}</mat-option></mat-select
            ></mat-form-field
          >
        </div>
        @if (loading()) {
          <p class="state" role="status">Loading alerts…</p>
        } @else if (filtered().length === 0) {
          <div class="empty" role="status">
            <mat-icon>notifications_none</mat-icon>
            <p>{{ (alerts().length ? 'alerts.noMatches' : 'alerts.empty') | translate }}</p>
          </div>
        } @else {
          <div class="table-wrap" role="region" aria-label="Alerts table" tabindex="0">
            <table
              mat-table
              [dataSource]="pageAlerts()"
              [attr.aria-label]="'alerts.title' | translate"
            >
              <ng-container matColumnDef="alert"
                ><th mat-header-cell *matHeaderCellDef>{{ 'alerts.alert' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  <strong>{{
                    (alert.type === 'LOW_STOCK' ? 'alerts.lowStock' : 'alerts.expired') | translate
                  }}</strong
                  ><span class="message">{{ alert.message }}</span>
                </td></ng-container
              >
              <ng-container matColumnDef="related"
                ><th mat-header-cell *matHeaderCellDef>{{ 'common.productLot' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  <strong>{{ productName(alert.productId) }}</strong>
                  @if (alert.lotId !== null) {
                    <span class="message">{{ lotName(alert.lotId) }}</span>
                  }
                </td></ng-container
              >
              <ng-container matColumnDef="level"
                ><th mat-header-cell *matHeaderCellDef>{{ 'alerts.level' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  <span
                    class="chip"
                    [class.warning]="alert.level === 'WARNING'"
                    [class.critical]="alert.level === 'CRITICAL'"
                    >{{
                      (alert.level === 'WARNING' ? 'alerts.warning' : 'alerts.critical') | translate
                    }}</span
                  >
                </td></ng-container
              >
              <ng-container matColumnDef="generated"
                ><th mat-header-cell *matHeaderCellDef>{{ 'alerts.generated' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  {{ alert.generatedAt | date: 'medium' }}
                </td></ng-container
              >
              <ng-container matColumnDef="status"
                ><th mat-header-cell *matHeaderCellDef>{{ 'common.status' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  <span
                    class="chip"
                    [class.pending]="!alert.attended"
                    [class.attended]="alert.attended"
                    >{{ (alert.attended ? 'alerts.attended' : 'alerts.pending') | translate }}</span
                  >
                </td></ng-container
              >
              <ng-container matColumnDef="action"
                ><th mat-header-cell *matHeaderCellDef>{{ 'alerts.action' | translate }}</th>
                <td mat-cell *matCellDef="let alert">
                  @if (!alert.attended) {
                    <button
                      mat-button
                      type="button"
                      [attr.aria-label]="
                        'Mark alert for ' + productName(alert.productId) + ' as attended'
                      "
                      (click)="attend(alert)"
                    >
                      <mat-icon>check</mat-icon> {{ 'alerts.attend' | translate }}
                    </button>
                  }
                </td></ng-container
              >
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          </div>
          <mat-paginator
            aria-label="Alert pagination"
            [length]="filtered().length"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 25]"
            [showFirstLastButtons]="true"
            (page)="onPage($event)"
          />
        }
      </section>
    </main>
  `,
  styles: `
    .alerts-page {
      padding: 24px;
      min-height: 100%;
      background: var(--bodego-background);
    }
    .alerts-page > * {
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }
    .page-header h1 {
      margin: 0;
    }
    .page-header p {
      margin: 6px 0 0;
      color: var(--bodego-text-muted);
    }
    .page-header button {
      white-space: nowrap;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px;
      background: var(--bodego-surface);
      border: 1px solid var(--bodego-border);
      border-radius: 12px;
    }
    .summary-card > mat-icon {
      color: var(--bodego-primary-hover);
      background: var(--bodego-primary-soft);
      padding: 12px;
      border-radius: 10px;
      box-sizing: content-box;
    }
    .summary-card div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .summary-card span {
      font-size: 13px;
      color: var(--bodego-text-muted);
    }
    .summary-card strong {
      font-size: 24px;
    }
    .summary-card.critical > mat-icon {
      color: var(--bodego-error);
      background: var(--bodego-error-soft);
    }
    .panel {
      background: var(--bodego-surface);
      border: 1px solid var(--bodego-border);
      border-radius: 12px;
      overflow: hidden;
    }
    .filters {
      display: flex;
      gap: 12px;
      padding: 20px 20px 4px;
    }
    .filters mat-form-field {
      width: 170px;
    }
    .filters .search {
      flex: 1;
      max-width: 400px;
    }
    .table-wrap {
      overflow-x: auto;
    }
    .table-wrap:focus-visible {
      outline: 2px solid var(--bodego-primary);
      outline-offset: -2px;
    }
    table {
      width: 100%;
      min-width: 900px;
    }
    th {
      font-weight: 600;
      color: var(--bodego-text-secondary);
    }
    td,
    th {
      padding: 12px 18px;
    }
    td strong,
    td .message {
      display: block;
    }
    .message {
      font-size: 12px;
      color: var(--bodego-text-secondary);
      margin-top: 4px;
    }
    .chip {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      background: var(--bodego-primary-soft);
      color: var(--bodego-primary-hover);
    }
    .chip.warning,
    .chip.pending {
      background: #fff7e6;
      color: #8a4b08;
    }
    .chip.critical {
      background: var(--bodego-error-soft);
      color: var(--bodego-error);
    }
    .chip.attended {
      background: var(--bodego-success-soft);
      color: var(--bodego-success);
    }
    .empty,
    .state {
      padding: 44px;
      text-align: center;
      color: var(--bodego-text-muted);
    }
    .empty mat-icon {
      font-size: 42px;
      width: 42px;
      height: 42px;
    }
    .error-state {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--bodego-error);
      margin-bottom: 16px;
    }
    mat-paginator {
      border-top: 1px solid var(--bodego-border);
    }
    @media (max-width: 900px) {
      .summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .filters {
        flex-wrap: wrap;
      }
      .filters .search {
        flex-basis: 100%;
        max-width: none;
      }
      .filters mat-form-field {
        flex: 1;
        min-width: 150px;
      }
    }
    @media (max-width: 600px) {
      .alerts-page {
        padding: 16px;
      }
      .page-header {
        align-items: flex-start;
        flex-direction: column;
      }
      .summary-grid {
        grid-template-columns: 1fr;
      }
      .filters {
        flex-direction: column;
      }
      .filters mat-form-field,
      .filters .search {
        width: 100%;
        max-width: none;
      }
    }
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
  readonly criticalAlerts = computed(
    () => this.alerts().filter((alert) => alert.level === 'CRITICAL').length,
  );
  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.alerts().filter((alert) => {
      const text =
        `${alert.message} ${this.productName(alert.productId)} ${this.lotName(alert.lotId)}`.toLowerCase();
      return (
        (!term || text.includes(term)) &&
        (this.typeFilter() === 'all' || alert.type === this.typeFilter()) &&
        (this.levelFilter() === 'all' || alert.level === this.levelFilter()) &&
        (this.statusFilter() === 'all' || (this.statusFilter() === 'attended') === alert.attended)
      );
    });
  });
  readonly pageAlerts = computed(() =>
    this.filtered().slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize(),
    ),
  );

  ngOnInit(): void {
    this.reload();
  }
  reload(): void {
    this.store.loadAlerts();
  }
  attend(alert: Alert): void {
    this.store.attendAlert(alert);
  }
  productName(id: number | null): string {
    return this.products().find((product) => product.id === id)?.name ?? 'Product unavailable';
  }
  lotName(id: number | null): string {
    return this.lots().find((lot) => lot.id === id)?.batchNumber ?? 'Lot unavailable';
  }
  typeName(alert: Alert): string {
    return alert.type === 'LOW_STOCK' ? 'Low stock' : 'Expired lot';
  }
  onSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerm.set(event.target.value);
      this.pageIndex.set(0);
    }
  }
  onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
