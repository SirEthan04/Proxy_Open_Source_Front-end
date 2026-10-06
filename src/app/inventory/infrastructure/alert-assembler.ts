import { Alert } from '../domain/model/alert.entity';
import { AlertRequest } from './alert-request';
import { AlertResponse } from './alert-response';

export class AlertAssembler {
  static toEntity(response: AlertResponse): Alert {
    return new Alert(response.id, response.productId, response.lotId, response.type, response.level, response.message, response.generatedAt, response.attended);
  }

  static toEntities(responses: AlertResponse[]): Alert[] {
    return responses.map((response) => this.toEntity(response));
  }

  static toRequest(alert: Alert): AlertRequest {
    return { productId: alert.productId, lotId: alert.lotId, type: alert.type, level: alert.level, message: alert.message, generatedAt: alert.generatedAt, attended: alert.attended };
  }
}
