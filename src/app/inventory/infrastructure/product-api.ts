import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Product } from '../domain/model/product.entity';
import { ProductResponse } from './product-response';
import { ProductRequest } from './product-request';
import { ProductAssembler } from './product-assembler';

@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000/api/v1/products';

  getAll(): Observable<Product[]> {
    return this.http
      .get<ProductResponse[]>(this.baseUrl)
      .pipe(map((responses) => ProductAssembler.toEntities(responses)));
  }

  getById(id: number): Observable<Product> {
    return this.http
      .get<ProductResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => ProductAssembler.toEntity(response)));
  }

  create(product: Product): Observable<Product> {
    const request: ProductRequest = ProductAssembler.toRequest(product);

    return this.http
      .post<ProductResponse>(this.baseUrl, request)
      .pipe(map((response) => ProductAssembler.toEntity(response)));
  }

  update(product: Product): Observable<Product> {
    const request: ProductRequest = ProductAssembler.toRequest(product);

    return this.http
      .put<ProductResponse>(`${this.baseUrl}/${product.id}`, request)
      .pipe(map((response) => ProductAssembler.toEntity(response)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
