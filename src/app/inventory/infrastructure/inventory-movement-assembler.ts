import { InventoryMovement } from '../domain/model/inventory-movement.entity';
import { InventoryMovementRequest } from './inventory-movement-request';
import { InventoryMovementResponse } from './inventory-movement-response';

export class InventoryMovementAssembler {
  static toEntity(response: InventoryMovementResponse): InventoryMovement {
    return new InventoryMovement(
      response.id,
      response.lotId,
      response.userId,
      response.type,
      response.quantity,
      response.date,
      response.reason,
    );
  }

  static toEntities(responses: InventoryMovementResponse[]): InventoryMovement[] {
    return responses.map((response) => this.toEntity(response));
  }

  static toRequest(movement: InventoryMovement): InventoryMovementRequest {
    return {
      lotId: movement.lotId,
      userId: movement.userId,
      type: movement.type,
      quantity: movement.quantity,
      date: movement.date,
      reason: movement.reason,
    };
  }
}
