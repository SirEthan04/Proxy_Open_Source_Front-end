import { effect, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PhysicalCountPaginatorIntl extends MatPaginatorIntl {
  private readonly translate = inject(TranslateService);

  constructor() {
    super();
    effect(() => {
      this.translate.currentLang();
      this.itemsPerPageLabel = this.translate.instant('physicalCounts.pagination.itemsPerPage');
      this.nextPageLabel = this.translate.instant('physicalCounts.pagination.nextPage');
      this.previousPageLabel = this.translate.instant('physicalCounts.pagination.previousPage');
      this.firstPageLabel = this.translate.instant('physicalCounts.pagination.firstPage');
      this.lastPageLabel = this.translate.instant('physicalCounts.pagination.lastPage');
      this.changes.next();
    });
    this.getRangeLabel = (page, size, length) => {
      const total = Math.max(0, length);
      if (!total || !size)
        return this.translate.instant('physicalCounts.pagination.emptyRange', { total });
      const start = page * size;
      return this.translate.instant('physicalCounts.pagination.range', {
        start: start + 1,
        end: Math.min(start + size, total),
        total,
      });
    };
  }
}
