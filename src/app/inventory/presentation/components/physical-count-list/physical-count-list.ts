import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { User } from '../../../../iam/domain/model/user.entity';

@Component({
  selector: 'app-physical-count-list',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatPaginatorModule, MatIconModule],
  template: `
    <section class="inventory-panel" aria-label="Physical counts">
      <div class="table-tools">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search counts</mat-label><mat-icon matPrefix>search</mat-icon>
          <input matInput type="search" placeholder="Product, lot, user, observation" [value]="searchTerm()" (input)="onSearchChange($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Difference</mat-label>
          <mat-select [value]="selectedDifference()" (selectionChange)="selectedDifference.set($event.value)">
            <mat-option value="all">All counts</mat-option><mat-option value="match">Match</mat-option><mat-option value="surplus">Surplus</mat-option><mat-option value="shortage">Shortage</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Product / lot</mat-label>
          <mat-select [value]="selectedLotId()" (selectionChange)="selectedLotId.set($event.value)">
            <mat-option [value]="0">All lots</mat-option>
            @for (lot of lots(); track lot.id) { <mat-option [value]="lot.id">{{ lotLabel(lot) }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>
      @if (filtered().length === 0) {
        <div class="empty-state" role="status"><mat-icon>{{ counts().length ? 'filter_alt_off' : 'fact_check' }}</mat-icon><p>{{ counts().length ? 'No counts match the selected filters.' : 'No physical counts recorded yet.' }}</p></div>
      } @else {
        <div class="table-container" role="region" aria-label="Physical counts table" tabindex="0">
          <table mat-table [dataSource]="pageCounts()" aria-label="Physical count history">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let count">{{ count.date }}</td></ng-container>
            <ng-container matColumnDef="lot"><th mat-header-cell *matHeaderCellDef>Product / lot</th><td mat-cell *matCellDef="let count">{{ lotLabelForId(count.lotId) }}</td></ng-container>
            <ng-container matColumnDef="system"><th mat-header-cell *matHeaderCellDef>System</th><td mat-cell *matCellDef="let count">{{ count.systemQuantity }}</td></ng-container>
            <ng-container matColumnDef="physical"><th mat-header-cell *matHeaderCellDef>Physical</th><td mat-cell *matCellDef="let count">{{ count.physicalQuantity }}</td></ng-container>
            <ng-container matColumnDef="difference"><th mat-header-cell *matHeaderCellDef>Difference</th><td mat-cell *matCellDef="let count"><span class="status" [class.shortage]="count.difference < 0" [class.surplus]="count.difference > 0">{{ count.difference > 0 ? '+' : '' }}{{ count.difference }} · {{ statusLabel(count.difference) }}</span></td></ng-container>
            <ng-container matColumnDef="user"><th mat-header-cell *matHeaderCellDef>Responsible</th><td mat-cell *matCellDef="let count">{{ userName(count.userId) }}</td></ng-container>
            <ng-container matColumnDef="observation"><th mat-header-cell *matHeaderCellDef>Observation</th><td mat-cell *matCellDef="let count">{{ count.observation || '—' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <mat-paginator aria-label="Physical count pagination" [length]="filtered().length" [pageIndex]="pageIndex()" [pageSize]="pageSize()" [pageSizeOptions]="[5, 10, 25]" [showFirstLastButtons]="true" (page)="onPageChange($event)" />
      }
    </section>
  `,
  styles: `
    .inventory-panel{background:white;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.table-container{width:100%;overflow-x:auto}.table-container:focus-visible{outline:2px solid #374151;outline-offset:-2px}table{width:100%;min-width:1000px}th{font-weight:600;color:#374151}td,th{padding-left:16px;padding-right:16px}.table-tools{display:flex;align-items:center;gap:16px;padding:20px 20px 4px}.search-field{flex:1;max-width:420px}.filter-field{width:220px}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:#595959}.empty-state mat-icon{width:48px;height:48px;font-size:48px}.status{display:inline-block;padding:5px 10px;border-radius:16px;background:#f3f4f6;color:#374151;font-size:12px;font-weight:600;white-space:nowrap}.status.shortage{background:#fff1f0;color:#a12822}.status.surplus{background:#e8f5e9;color:#216e39}mat-paginator{border-top:1px solid #e5e7eb}@media(max-width:768px){.table-tools{flex-direction:column;align-items:stretch}.search-field,.filter-field{width:100%;max-width:none}}
  `,
})
export class PhysicalCountList {
  readonly counts = input.required<PhysicalCount[]>();
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly users = input.required<User[]>();
  readonly searchTerm = signal('');
  readonly selectedDifference = signal('all');
  readonly selectedLotId = signal(0);
  readonly pageSize = signal(5);
  readonly columns = ['date', 'lot', 'system', 'physical', 'difference', 'user', 'observation'];
  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedDifference();
    const lotId = this.selectedLotId();
    return this.counts().filter((count) => {
      const text = `${this.lotLabelForId(count.lotId)} ${this.userName(count.userId)} ${count.observation}`.toLowerCase();
      const matchesStatus = status === 'all' || (status === 'match' && count.difference === 0) || (status === 'surplus' && count.difference > 0) || (status === 'shortage' && count.difference < 0);
      return (!term || text.includes(term)) && matchesStatus && (!lotId || count.lotId === lotId);
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });
  readonly pageIndex = linkedSignal<{ count: number; size: number; term: string; status: string; lot: number }, number>({
    source: () => ({ count: this.filtered().length, size: this.pageSize(), term: this.searchTerm(), status: this.selectedDifference(), lot: this.selectedLotId() }),
    computation: (source, previous) => !previous || source.term !== previous.source.term || source.status !== previous.source.status || source.lot !== previous.source.lot ? 0 : Math.min(previous.value, Math.max(0, Math.ceil(source.count / source.size) - 1)),
  });
  readonly pageCounts = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));

  lotLabel(lot: Lot): string { return `${this.products().find((product) => product.id === lot.productId)?.name ?? 'Product unavailable'} — ${lot.batchNumber}`; }
  lotLabelForId(lotId: number): string { const lot = this.lots().find((item) => item.id === lotId); return lot ? this.lotLabel(lot) : 'Lot unavailable'; }
  userName(userId: number): string { return this.users().find((user) => user.id === userId)?.name ?? 'User unavailable'; }
  statusLabel(difference: number): string { return difference === 0 ? 'Match' : difference > 0 ? 'Surplus' : 'Shortage'; }
  onSearchChange(event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.searchTerm.set(target.value); }
  onPageChange(event: PageEvent): void { this.pageSize.set(event.pageSize); this.pageIndex.set(event.pageIndex); }
}
