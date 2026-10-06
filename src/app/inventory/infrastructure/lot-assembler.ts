import { Lot } from '../domain/model/lot.entity';
import { LotRequest } from './lot-request';
import { LotResponse } from './lot-response';

export class LotAssembler {
  static toEntity(response: LotResponse): Lot {
    return new Lot(
      response.id,
      response.productId,
      response.batchNumber,
      response.quantity,
      response.expirationDate,
      response.entryDate,
      response.active,
    );
  }

  static toEntities(responses: LotResponse[]): Lot[] {
    return responses.map((response) => this.toEntity(response));
  }

  static toRequest(lot: Lot): LotRequest {
    return {
      productId: lot.productId,
      batchNumber: lot.batchNumber,
      quantity: lot.quantity,
      expirationDate: lot.expirationDate,
      entryDate: lot.entryDate,
      active: lot.active,
    };
  }
}
