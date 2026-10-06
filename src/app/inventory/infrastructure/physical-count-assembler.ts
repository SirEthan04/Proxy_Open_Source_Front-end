import { PhysicalCount } from '../domain/model/physical-count.entity';
import { PhysicalCountRequest } from './physical-count-request';
import { PhysicalCountResponse } from './physical-count-response';

export class PhysicalCountAssembler {
  static toEntity(response: PhysicalCountResponse): PhysicalCount {
    return new PhysicalCount(response.id, response.lotId, response.userId, response.systemQuantity,
      response.physicalQuantity, response.difference, response.date, response.observation);
  }

  static toEntities(responses: PhysicalCountResponse[]): PhysicalCount[] {
    return responses.map((response) => this.toEntity(response));
  }

  static toRequest(count: PhysicalCount): PhysicalCountRequest {
    return {
      lotId: count.lotId,
      userId: count.userId,
      systemQuantity: count.systemQuantity,
      physicalQuantity: count.physicalQuantity,
      difference: count.physicalQuantity - count.systemQuantity,
      date: count.date,
      observation: count.observation,
    };
  }
}
