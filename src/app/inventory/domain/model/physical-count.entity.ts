export class PhysicalCount {
  constructor(
    public id: number = 0,
    public lotId: number = 0,
    public userId: number = 0,
    public systemQuantity: number = 0,
    public physicalQuantity: number = 0,
<<<<<<< HEAD
    public difference: number = 0,
    public date: string = '',
    public observation: string = '',
  ) {}
=======
    public date: string = '',
    public observation: string = '',
  ) {}

  get difference(): number {
    return this.physicalQuantity - this.systemQuantity;
  }
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
}
