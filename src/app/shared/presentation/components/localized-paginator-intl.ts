import { effect, inject, Service } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Service()
export class LocalizedPaginatorIntl extends MatPaginatorIntl {
  private readonly translate = inject(TranslateService);

  constructor() {
    super();
    effect(() => {
      this.translate.currentLang();
      this.itemsPerPageLabel = this.translate.instant('common.pagination.itemsPerPage');
      this.nextPageLabel = this.translate.instant('common.pagination.nextPage');
      this.previousPageLabel = this.translate.instant('common.pagination.previousPage');
      this.firstPageLabel = this.translate.instant('common.pagination.firstPage');
      this.lastPageLabel = this.translate.instant('common.pagination.lastPage');
      this.changes.next();
    });
    this.getRangeLabel = (page, size, length) => {
      const total = Math.max(0, length);
      if (!total || !size) return this.translate.instant('common.pagination.emptyRange', { total });
      const start = page * size;
      return this.translate.instant('common.pagination.range', {
        start: start + 1,
        end: Math.min(start + size, total),
        total,
      });
    };
  }
}
