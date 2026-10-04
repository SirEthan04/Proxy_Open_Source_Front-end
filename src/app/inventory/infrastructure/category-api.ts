import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Category } from '../domain/model/category.entity';
import { CategoryResponse } from './category-response';
import { CategoryAssembler } from './category-assembler';

@Injectable({
  providedIn: 'root',
})
export class CategoryApi {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000/api/v1/categories';

  getAll(): Observable<Category[]> {
    return this.http
      .get<CategoryResponse[]>(this.baseUrl)
      .pipe(map((responses) => CategoryAssembler.toEntities(responses)));
  }
}
