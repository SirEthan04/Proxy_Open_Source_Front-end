import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { inject, Component, computed, input, linkedSignal, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { InventoryMovement, InventoryMovementType } from '../../../domain/model/inventory-movement.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

@Component({
  selector: 'app-movement-list',
  imports: [TranslatePipe, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatPaginatorModule, MatIconModule],
  template: `
    <section class="inventory-panel" [attr.aria-label]="'movements.inventory' | translate">
      <div class="table-tools">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ 'movements.search' | translate }}</mat-label><mat-icon matPrefix>search</mat-icon>
          <input matInput type="search" [placeholder]="'movements.searchPlaceholder' | translate" [value]="searchTerm()" (input)="onSearchChange($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'common.type' | translate }}</mat-label>
          <mat-select [value]="selectedType()" (selectionChange)="selectedType.set($event.value)">
            <mat-option value="all">{{ 'common.allTypes' | translate }}</mat-option><mat-option value="ENTRY">{{ 'movements.entry' | translate }}</mat-option><mat-option value="EXIT">{{ 'movements.exit' | translate }}</mat-option><mat-option value="ADJUSTMENT">{{ 'movements.adjustment' | translate }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ 'common.productLot' | translate }}</mat-label>
          <mat-select [value]="selectedLotId()" (selectionChange)="selectedLotId.set($event.value)">
            <mat-option [value]="0">{{ 'common.allLots' | translate }}</mat-option>
            @for (lot of lots(); track lot.id) { <mat-option [value]="lot.id">{{ lotLabel(lot) }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>
      @if (filtered().length === 0) {
        <div class="empty-state" role="status"><mat-icon>{{ movements().length ? 'filter_alt_off' : 'swap_horiz' }}</mat-icon><p>{{ movements().length ? ('movements.noResults' | translate) : ('movements.empty' | translate) }}</p></div>
      } @else {
        <div class="table-container" role="region" [attr.aria-label]="'movements.table' | translate" tabindex="0">
          <table mat-table [dataSource]="pageMovements()" [attr.aria-label]="'movements.history' | translate">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>{{ 'common.date' | translate }}</th><td mat-cell *matCellDef="let movement">{{ movement.date }}</td></ng-container>
            <ng-container matColumnDef="lot"><th mat-header-cell *matHeaderCellDef>{{ 'common.productLot' | translate }}</th><td mat-cell *matCellDef="let movement">{{ lotLabelForId(movement.lotId) }}</td></ng-container>
            <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>{{ 'common.type' | translate }}</th><td mat-cell *matCellDef="let movement"><span class="type" [class.entry]="movement.type === 'ENTRY'" [class.exit]="movement.type === 'EXIT'">{{ typeLabel(movement.type) }}</span></td></ng-container>
            <ng-container matColumnDef="quantity"><th mat-header-cell *matHeaderCellDef>{{ 'common.quantity' | translate }}</th><td mat-cell *matCellDef="let movement">{{ movement.quantity }}</td></ng-container>
            <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef>{{ 'movements.reason' | translate }}</th><td mat-cell *matCellDef="let movement">{{ movement.reason || '—' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <mat-paginator [attr.aria-label]="'movements.pagination' | translate" [length]="filtered().length" [pageIndex]="pageIndex()" [pageSize]="pageSize()" [pageSizeOptions]="[5, 10, 25]" [showFirstLastButtons]="true" (page)="onPageChange($event)" />
      }
    </section>
  `,
  styles: `
    .inventory-panel{background:white;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.table-container{width:100%;overflow-x:auto}.table-container:focus-visible{outline:2px solid #374151;outline-offset:-2px}table{width:100%;min-width:720px}th{font-weight:600;color:#374151}td,th{padding-left:20px;padding-right:20px}.table-tools{display:flex;align-items:center;gap:16px;padding:20px 20px 4px}.search-field{flex:1;max-width:420px}.filter-field{width:220px}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;color:#595959}.empty-state mat-icon{width:48px;height:48px;font-size:48px}.type{display:inline-block;padding:5px 10px;border-radius:16px;background:#f3f4f6;color:#374151;font-size:12px;font-weight:600}.type.entry{background:#e8f5e9;color:#216e39}.type.exit{background:#fff1f0;color:#a12822}mat-paginator{border-top:1px solid #e5e7eb}@media(max-width:768px){.table-tools{flex-direction:column;align-items:stretch}.search-field,.filter-field{width:100%;max-width:none}}
  `,
})
export class MovementList {
  readonly translate = inject(TranslateService);
  readonly movements = input.required<InventoryMovement[]>();
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly searchTerm = signal('');
  readonly selectedType = signal('all');
  readonly selectedLotId = signal(0);
  readonly pageSize = signal(5);
  readonly columns = ['date', 'lot', 'type', 'quantity', 'reason'];
  readonly filtered = computed(() => {
    this.translate.currentLang();
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const lotId = this.selectedLotId();
    return this.movements().filter((movement) => {
      const text = `${this.lotLabelForId(movement.lotId)} ${movement.reason}`.toLowerCase();
      return (!term || text.includes(term)) && (type === 'all' || movement.type === type) && (!lotId || movement.lotId === lotId);
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });
  readonly pageIndex = linkedSignal<{ count: number; size: number; term: string; type: string; lot: number }, number>({ source: () => ({ count: this.filtered().length, size: this.pageSize(), term: this.searchTerm(), type: this.selectedType(), lot: this.selectedLotId() }),
    computation: (source, previous) => !previous || source.term !== previous.source.term || source.type !== previous.source.type || source.lot !== previous.source.lot ? 0 : Math.min(previous.value, Math.max(0, Math.ceil(source.count / source.size) - 1)),
  });
  readonly pageMovements = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  lotLabel(lot: Lot): string { return `${this.products().find((product) => product.id === lot.productId)?.name ?? this.translate.instant('common.productUnavailable')} — ${lot.batchNumber}`; }
  lotLabelForId(lotId: number): string { const lot = this.lots().find((item) => item.id === lotId); return lot ? this.lotLabel(lot) : this.translate.instant('common.lotUnavailable'); }
  typeLabel(type: InventoryMovementType): string { return type === 'ENTRY' ? this.translate.instant('movements.entry') : type === 'EXIT' ? this.translate.instant('movements.exit') : this.translate.instant('movements.adjustment'); }
  onSearchChange(event: Event): void { const target = event.target; if (target instanceof HTMLInputElement) this.searchTerm.set(target.value); }
  onPageChange(event: PageEvent): void { this.pageSize.set(event.pageSize); this.pageIndex.set(event.pageIndex); }
}
