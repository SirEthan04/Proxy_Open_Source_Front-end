import { InventoryMovementType } from '../domain/model/inventory-movement.entity';

export interface InventoryMovementRequest {
  lotId: number;
  userId: number;
  type: InventoryMovementType;
  quantity: number;
  date: string;
  reason: string;
}
