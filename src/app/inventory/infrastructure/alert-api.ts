import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Alert } from '../domain/model/alert.entity';
import { AlertAssembler } from './alert-assembler';
import { AlertResponse } from './alert-response';

@Injectable({ providedIn: 'root' })
export class AlertApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/alerts';

  getAll(): Observable<Alert[]> {
    return this.http.get<AlertResponse[]>(this.baseUrl).pipe(map((responses) => AlertAssembler.toEntities(responses)));
  }

  create(alert: Alert): Observable<Alert> {
    return this.http.post<AlertResponse>(this.baseUrl, AlertAssembler.toRequest(alert)).pipe(map((response) => AlertAssembler.toEntity(response)));
  }

  update(alert: Alert): Observable<Alert> {
    return this.http.put<AlertResponse>(`${this.baseUrl}/${alert.id}`, AlertAssembler.toRequest(alert)).pipe(map((response) => AlertAssembler.toEntity(response)));
  }
}
