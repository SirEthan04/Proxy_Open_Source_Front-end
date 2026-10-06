export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';

export class InventoryMovement {
  constructor(
    public id: number = 0,
    public lotId: number = 0,
    public userId: number | null = null,
    public type: MovementType = 'ENTRY',
    public quantity: number = 0,
    public date: string = '',
    public reason: string = '',
  ) {}
}
