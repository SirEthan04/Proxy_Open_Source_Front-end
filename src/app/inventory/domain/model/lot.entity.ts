export class Lot {
  constructor(
    public id: number = 0,
    public productId: number = 0,
    public batchNumber: string = '',
    public quantity: number = 0,
    public expirationDate: string | null = null,
    public entryDate: string = '',
    public active: boolean = true,
  ) {}
}
