export interface ProductResponse {
  id: number;
  businessId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  minimumStock: number;
  active: boolean;
}
