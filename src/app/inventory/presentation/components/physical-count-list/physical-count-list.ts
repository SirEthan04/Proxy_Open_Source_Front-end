import { TranslatePipe } from '@ngx-translate/core';
import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { User } from '../../../../iam/domain/model/user.entity';

@Component({
  selector: 'app-physical-count-list',
  imports: [
    TranslatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  template: `
    <section class="inventory-panel" aria-label="Physical count history">
      <div class="table-tools">
        <mat-form-field appearance="outline" class="search-field"
          ><mat-label>{{ 'counts.search' | translate }}</mat-label
          ><mat-icon matPrefix>search</mat-icon
          ><input
            matInput
            type="search"
            placeholder="Product, lot, user, observation"
            [value]="searchTerm()"
            (input)="onSearchChange($event)"
        /></mat-form-field>
        <mat-form-field appearance="outline" class="filter-field"
          ><mat-label>{{ 'counts.difference' | translate }}</mat-label
          ><mat-select
            [value]="selectedDifference()"
            (selectionChange)="selectedDifference.set($event.value)"
            ><mat-option value="all">{{ 'counts.all' | translate }}</mat-option
            ><mat-option value="MATCH">{{ 'counts.noDifference' | translate }}</mat-option
            ><mat-option value="SURPLUS">{{ 'counts.surplus' | translate }}</mat-option
            ><mat-option value="SHORTAGE">{{
              'counts.shortage' | translate
            }}</mat-option></mat-select
          ></mat-form-field
        >
      </div>
      @if (filtered().length === 0) {
        <div class="empty-state" role="status">
          <mat-icon>{{ counts().length ? 'filter_alt_off' : 'fact_check' }}</mat-icon>
          <p>{{ (counts().length ? 'counts.noMatches' : 'counts.empty') | translate }}</p>
        </div>
      } @else {
        <div class="table-container" role="region" aria-label="Physical counts table" tabindex="0">
          <table mat-table [dataSource]="pageCounts()" aria-label="Physical count history">
            <ng-container matColumnDef="date"
              ><th mat-header-cell *matHeaderCellDef>{{ 'common.date' | translate }}</th>
              <td mat-cell *matCellDef="let count">{{ count.date }}</td></ng-container
            >
            <ng-container matColumnDef="lot"
              ><th mat-header-cell *matHeaderCellDef>{{ 'common.productLot' | translate }}</th>
              <td mat-cell *matCellDef="let count">
                {{ lotLabelForId(count.lotId) }}
              </td></ng-container
            >
            <ng-container matColumnDef="system"
              ><th mat-header-cell *matHeaderCellDef>{{ 'counts.system' | translate }}</th>
              <td mat-cell *matCellDef="let count">{{ count.systemQuantity }}</td></ng-container
            >
            <ng-container matColumnDef="physical"
              ><th mat-header-cell *matHeaderCellDef>{{ 'counts.physical' | translate }}</th>
              <td mat-cell *matCellDef="let count">{{ count.physicalQuantity }}</td></ng-container
            >
            <ng-container matColumnDef="difference"
              ><th mat-header-cell *matHeaderCellDef>{{ 'counts.difference' | translate }}</th>
              <td mat-cell *matCellDef="let count">
                <span
                  class="difference"
                  [class.match]="count.difference === 0"
                  [class.surplus]="count.difference > 0"
                  [class.shortage]="count.difference < 0"
                  >{{ count.difference > 0 ? '+' : '' }}{{ count.difference }} ·
                  {{ differenceLabel(count.difference) | translate }}</span
                >
              </td></ng-container
            >
            <ng-container matColumnDef="user"
              ><th mat-header-cell *matHeaderCellDef>{{ 'counts.responsible' | translate }}</th>
              <td mat-cell *matCellDef="let count">{{ userName(count.userId) }}</td></ng-container
            >
            <ng-container matColumnDef="observation"
              ><th mat-header-cell *matHeaderCellDef>{{ 'common.observation' | translate }}</th>
              <td mat-cell *matCellDef="let count">{{ count.observation || '—' }}</td></ng-container
            >
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <mat-paginator
          aria-label="Physical count pagination"
          [length]="filtered().length"
          [pageIndex]="pageIndex()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[5, 10, 25]"
          [showFirstLastButtons]="true"
          (page)="onPageChange($event)"
        />
      }
    </section>
  `,
  styles: `
    .inventory-panel {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .table-container {
      width: 100%;
      overflow-x: auto;
    }
    .table-container:focus-visible {
      outline: 2px solid #374151;
      outline-offset: -2px;
    }
    table {
      width: 100%;
      min-width: 980px;
    }
    th {
      font-weight: 600;
      color: #374151;
    }
    td,
    th {
      padding-left: 16px;
      padding-right: 16px;
    }
    .table-tools {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 20px 4px;
    }
    .search-field {
      flex: 1;
      max-width: 480px;
    }
    .filter-field {
      width: 220px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #595959;
    }
    .empty-state mat-icon {
      width: 48px;
      height: 48px;
      font-size: 48px;
    }
    .difference {
      display: inline-block;
      padding: 5px 9px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .difference.match {
      background: #e8f5e9;
      color: #216e39;
    }
    .difference.surplus {
      background: #e8f0fe;
      color: #174ea6;
    }
    .difference.shortage {
      background: #fff1f0;
      color: #a12822;
    }
    mat-paginator {
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 768px) {
      .table-tools {
        flex-direction: column;
        align-items: stretch;
      }
      .search-field,
      .filter-field {
        width: 100%;
        max-width: none;
      }
    }
  `,
})
export class PhysicalCountList {
  readonly counts = input.required<PhysicalCount[]>();
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly users = input<User[]>([]);
  readonly searchTerm = signal('');
  readonly selectedDifference = signal('all');
  readonly pageSize = signal(5);
  readonly columns = ['date', 'lot', 'system', 'physical', 'difference', 'user', 'observation'];
  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedDifference();
    return this.counts()
      .filter((count) => {
        const text =
          `${this.lotLabelForId(count.lotId)} ${this.userName(count.userId)} ${count.observation}`.toLowerCase();
        const kind =
          count.difference === 0 ? 'MATCH' : count.difference > 0 ? 'SURPLUS' : 'SHORTAGE';
        return (!term || text.includes(term)) && (filter === 'all' || kind === filter);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });
  readonly pageIndex = linkedSignal<
    { count: number; size: number; term: string; filter: string },
    number
  >({
    source: () => ({
      count: this.filtered().length,
      size: this.pageSize(),
      term: this.searchTerm(),
      filter: this.selectedDifference(),
    }),
    computation: (source, previous) =>
      !previous || source.term !== previous.source.term || source.filter !== previous.source.filter
        ? 0
        : Math.min(previous.value, Math.max(0, Math.ceil(source.count / source.size) - 1)),
  });
  readonly pageCounts = computed(() =>
    this.filtered().slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize(),
    ),
  );
  lotLabelForId(id: number): string {
    const lot = this.lots().find((item) => item.id === id);
    return lot
      ? `${this.products().find((item) => item.id === lot.productId)?.name ?? 'Product unavailable'} — ${lot.batchNumber}`
      : 'Lot unavailable';
  }
  userName(id: number): string {
    return this.users().find((user) => user.id === id)?.name ?? `User ${id}`;
  }
  differenceLabel(value: number): string {
    return value === 0 ? 'counts.match' : value > 0 ? 'counts.surplus' : 'counts.shortage';
  }
  onSearchChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.searchTerm.set(event.target.value);
  }
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
