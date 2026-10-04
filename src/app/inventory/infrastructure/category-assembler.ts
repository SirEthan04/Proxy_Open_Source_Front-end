import { Category } from '../domain/model/category.entity';
import { CategoryResponse } from './category-response';

export class CategoryAssembler {
  static toEntity(response: CategoryResponse): Category {
    return new Category(response.id, response.name, response.description);
  }

  static toEntities(responses: CategoryResponse[]): Category[] {
    return responses.map((response) => this.toEntity(response));
  }
}
