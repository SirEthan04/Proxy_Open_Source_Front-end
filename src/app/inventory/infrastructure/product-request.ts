export interface ProductRequest {
  businessId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  minimumStock: number;
  active: boolean;
}
