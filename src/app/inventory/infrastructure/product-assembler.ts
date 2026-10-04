import { Product } from '../domain/model/product.entity';
import { ProductResponse } from './product-response';
import { ProductRequest } from './product-request';

export class ProductAssembler {
  static toEntity(response: ProductResponse): Product {
    return new Product(
      response.id,
      response.businessId,
      response.categoryId,
      response.name,
      response.description,
      response.price,
      response.minimumStock,
      response.active,
    );
  }

  static toEntities(responses: ProductResponse[]): Product[] {
    return responses.map((response) => this.toEntity(response));
  }

  static toRequest(product: Product): ProductRequest {
    return {
      businessId: product.businessId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      minimumStock: product.minimumStock,
      active: product.active,
    };
  }
}
