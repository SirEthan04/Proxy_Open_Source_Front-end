import { PhysicalCount } from '../domain/model/physical-count.entity';
import { PhysicalCountRequest } from './physical-count-request';
import { PhysicalCountResponse } from './physical-count-response';

export class PhysicalCountAssembler {
  static toEntity(response: PhysicalCountResponse): PhysicalCount {
<<<<<<< HEAD
    return new PhysicalCount(response.id, response.lotId, response.userId, response.systemQuantity,
      response.physicalQuantity, response.difference, response.date, response.observation);
=======
    return new PhysicalCount(
      response.id,
      response.lotId,
      response.userId,
      response.systemQuantity,
      response.physicalQuantity,
      response.date,
      response.observation,
    );
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
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
<<<<<<< HEAD
      difference: count.physicalQuantity - count.systemQuantity,
=======
>>>>>>> 9d1716863aaa72b25900d58047a642a5c38941b7
      date: count.date,
      observation: count.observation,
    };
  }
}
