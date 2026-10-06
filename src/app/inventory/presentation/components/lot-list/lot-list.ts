import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';

interface LotPageSource {
  count: number;
  size: number;
  term: string;
  product: number;
  status: string;
}

@Component({
  selector: 'app-lot-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  templateUrl: './lot-list.html',
  styleUrl: './lot-list.css',
})
export class LotList {
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly edit = output<Lot>();
  readonly remove = output<Lot>();
  readonly searchTerm = signal('');
  readonly selectedProductId = signal(0);
  readonly selectedStatus = signal('all');
  readonly pageSize = signal(5);
  readonly displayedColumns = [
    'batchNumber',
    'product',
    'quantity',
    'entryDate',
    'expirationDate',
    'status',
    'actions',
  ];

  private readonly productNames = computed(
    () => new Map(this.products().map((product) => [product.id, product.name])),
  );

  readonly filteredLots = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const productId = this.selectedProductId();
    const status = this.selectedStatus();
    return this.lots().filter(
      (lot) =>
        (!term ||
          lot.batchNumber.toLowerCase().includes(term) ||
          this.getProductName(lot.productId).toLowerCase().includes(term)) &&
        (productId === 0 || lot.productId === productId) &&
        (status === 'all' ||
          (status === 'active' && lot.active) ||
          (status === 'inactive' && !lot.active)),
    );
  });

  // Keep the current page in range after a deletion or a refresh.
  readonly pageIndex = linkedSignal<LotPageSource, number>({
    source: () => ({
      count: this.filteredLots().length,
      size: this.pageSize(),
      term: this.searchTerm(),
      product: this.selectedProductId(),
      status: this.selectedStatus(),
    }),
    computation: (source, previous) => {
      if (
        !previous ||
        source.term !== previous.source.term ||
        source.product !== previous.source.product ||
        source.status !== previous.source.status
      )
        return 0;
      return Math.min(previous.value, Math.max(0, Math.ceil(source.count / source.size) - 1));
    },
  });

  readonly paginatedLots = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredLots().slice(start, start + this.pageSize());
  });

  getProductName(productId: number): string {
    return this.productNames().get(productId) ?? 'Product unavailable';
  }

  onSearchChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.searchTerm.set(target.value);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
