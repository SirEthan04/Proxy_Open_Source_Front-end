export interface PhysicalCountRequest {
  lotId: number;
  userId: number;
  systemQuantity: number;
  physicalQuantity: number;
  difference: number;
  date: string;
  observation: string;
}
