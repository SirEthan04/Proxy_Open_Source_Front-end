import { AlertLevel, AlertType } from '../domain/model/alert.entity';

export interface AlertRequest {
  productId: number | null;
  lotId: number | null;
  type: AlertType;
  level: AlertLevel;
  message: string;
  generatedAt: string;
  attended: boolean;
}
