import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';

@Injectable({ providedIn: 'root' })
export class MovementApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/movements';
  getAll(): Observable<InventoryMovement[]> { return this.http.get<InventoryMovement[]>(this.baseUrl); }
  create(movement: InventoryMovement): Observable<InventoryMovement> {
    const { id: _id, ...request } = movement;
    return this.http.post<InventoryMovement>(this.baseUrl, request);
  }
}
