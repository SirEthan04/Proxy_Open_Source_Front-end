export type InventoryMovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';

export class InventoryMovement {
  constructor(
    public id: number = 0,
    public lotId: number = 0,
    public userId: number = 0,
    public type: InventoryMovementType = 'ENTRY',
    public quantity: number = 0,
    public date: string = '',
    public reason: string = '',
  ) {}
}
