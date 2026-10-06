import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lot } from '../domain/model/lot.entity';

@Injectable({ providedIn: 'root' })
export class LotApi {
  private readonly http = inject(HttpClient);
  getAll(): Observable<Lot[]> { return this.http.get<Lot[]>('http://localhost:3000/api/v1/lots'); }
}
