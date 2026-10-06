import { User } from '../domain/model/user.entity';
import { SignInResponse } from './sign-in-response';

export class SignInAssembler {
  static toEntity(response: SignInResponse): User {
    return new User(response.id, response.name, response.email, response.role);
  }

  static toEntities(responses: SignInResponse[]): User[] {
    return responses.map((response) => this.toEntity(response));
  }
}
