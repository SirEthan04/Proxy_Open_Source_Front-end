import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Lot } from '../domain/model/lot.entity';
import { LotRequest } from './lot-request';
import { LotResponse } from './lot-response';
import { LotAssembler } from './lot-assembler';

@Service()
export class LotApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/lots';

  getAll(): Observable<Lot[]> {
    return this.http.get<LotResponse[]>(this.baseUrl).pipe(map((responses) => LotAssembler.toEntities(responses)));
  }

  getById(id: number): Observable<Lot> {
    return this.http.get<LotResponse>(`${this.baseUrl}/${id}`).pipe(map((response) => LotAssembler.toEntity(response)));
  }

  create(lot: Lot): Observable<Lot> {
    const request: LotRequest = LotAssembler.toRequest(lot);
    return this.http.post<LotResponse>(this.baseUrl, request).pipe(map((response) => LotAssembler.toEntity(response)));
  }

  update(lot: Lot): Observable<Lot> {
    const request: LotRequest = LotAssembler.toRequest(lot);
    return this.http.put<LotResponse>(`${this.baseUrl}/${lot.id}`, request).pipe(map((response) => LotAssembler.toEntity(response)));
  }

  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/${id}`); }
}
