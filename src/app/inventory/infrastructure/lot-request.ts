export interface LotRequest {
  productId: number;
  batchNumber: string;
  quantity: number;
  expirationDate: string | null;
  entryDate: string;
  active: boolean;
}
