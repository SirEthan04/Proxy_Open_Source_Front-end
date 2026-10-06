import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { InventoryMovementAssembler } from './inventory-movement-assembler';
import { InventoryMovementResponse } from './inventory-movement-response';

@Service()
export class InventoryMovementApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/movements';

  getAll(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovementResponse[]>(this.baseUrl)
      .pipe(map((responses) => InventoryMovementAssembler.toEntities(responses)));
  }

  create(movement: InventoryMovement): Observable<InventoryMovement> {
    return this.http.post<InventoryMovementResponse>(this.baseUrl, InventoryMovementAssembler.toRequest(movement))
      .pipe(map((response) => InventoryMovementAssembler.toEntity(response)));
  }
}
