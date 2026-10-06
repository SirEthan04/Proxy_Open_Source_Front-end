import { InventoryMovementRequest } from './inventory-movement-request';

export interface InventoryMovementResponse extends InventoryMovementRequest {
  id: number;
}
