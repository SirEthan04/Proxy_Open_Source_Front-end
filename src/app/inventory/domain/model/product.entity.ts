export class Product {
  constructor(
    public id: number = 0,
    public businessId: number = 0,
    public categoryId: number = 0,
    public name: string = '',
    public description: string = '',
    public price: number = 0,
    public minimumStock: number = 0,
    public active: boolean = true,
  ) {}
}
