import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PhysicalCountPaginatorIntl } from './physical-count-paginator-intl';
import { PhysicalCount } from '../../../domain/model/physical-count.entity';
import { Lot } from '../../../domain/model/lot.entity';
import { Product } from '../../../domain/model/product.entity';
import { User } from '../../../../iam/domain/model/user.entity';

@Component({
  selector: 'app-physical-count-list',
  providers: [{ provide: MatPaginatorIntl, useClass: PhysicalCountPaginatorIntl }],
  imports: [
    TranslatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
  ],
  templateUrl: './physical-count-list.html',
  styleUrl: './physical-count-list.css',
})
export class PhysicalCountList {
  private readonly translate = inject(TranslateService);
  readonly counts = input.required<PhysicalCount[]>();
  readonly lots = input.required<Lot[]>();
  readonly products = input.required<Product[]>();
  readonly currentUser = input<User | null>(null);
  readonly searchTerm = signal('');
  readonly selectedStatus = signal('all');
  readonly selectedLotId = signal(0);
  readonly pageSize = signal(5);
  readonly columns = [
    'date',
    'product',
    'lot',
    'system',
    'physical',
    'difference',
    'user',
    'observation',
  ];
  private readonly lotsById = computed(() => new Map(this.lots().map((lot) => [lot.id, lot])));
  private readonly productsById = computed(
    () => new Map(this.products().map((product) => [product.id, product.name])),
  );

  readonly filtered = computed(() => {
    this.translate.currentLang();
    const term = this.searchTerm().trim().toLowerCase();
    return this.counts()
      .filter(
        (count) =>
          (!term ||
            `${this.productName(count.lotId)} ${this.batchNumber(count.lotId)} ${this.userName(count.userId)} ${count.observation} ${count.date}`
              .toLowerCase()
              .includes(term)) &&
          (!this.selectedLotId() || count.lotId === this.selectedLotId()) &&
          (this.selectedStatus() === 'all' ||
            this.status(count.difference) === this.selectedStatus()),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });
  readonly pageIndex = linkedSignal<
    { count: number; size: number; term: string; status: string; lot: number },
    number
  >({
    source: () => ({
      count: this.filtered().length,
      size: this.pageSize(),
      term: this.searchTerm(),
      status: this.selectedStatus(),
      lot: this.selectedLotId(),
    }),
    computation: (source, previous) =>
      !previous ||
      source.term !== previous.source.term ||
      source.status !== previous.source.status ||
      source.lot !== previous.source.lot
        ? 0
        : Math.min(previous.value, Math.max(0, Math.ceil(source.count / source.size) - 1)),
  });
  readonly pageCounts = computed(() =>
    this.filtered().slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize(),
    ),
  );

  productName(lotId: number): string {
    const lot = this.lotsById().get(lotId);
    return lot
      ? (this.productsById().get(lot.productId) ??
          this.translate.instant('common.productUnavailable'))
      : this.translate.instant('common.productUnavailable');
  }
  batchNumber(lotId: number): string {
    return (
      this.lotsById().get(lotId)?.batchNumber ?? this.translate.instant('common.lotUnavailable')
    );
  }
  lotLabel(lotId: number): string {
    return `${this.productName(lotId)} — ${this.batchNumber(lotId)}`;
  }
  userName(userId: number): string {
    const user = this.currentUser();
    return user?.id === userId
      ? user.name
      : this.translate.instant('common.userReference', { id: userId });
  }
  status(difference: number): string {
    return difference === 0 ? 'MATCH' : difference > 0 ? 'SURPLUS' : 'SHORTAGE';
  }
  onSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) this.searchTerm.set(event.target.value);
  }
  onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}
