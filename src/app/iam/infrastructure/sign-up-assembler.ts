import { SignUpCommand } from '../domain/model/sign-up.command';
import { User } from '../domain/model/user.entity';
import { isUserRole } from '../domain/model/user-role';
import { SignUpRequest } from './sign-up.request';
import { SignUpResponse } from './sign-up-response';

export class SignUpAssembler {
  static toRequest(command: SignUpCommand): SignUpRequest {
    return { username: command.username.trim(), password: command.password };
  }

  static toEntity(response: SignUpResponse): User {
    if (
      !Number.isInteger(response.id) ||
      typeof response.username !== 'string' ||
      !response.username.trim() ||
      !isUserRole(response.role)
    ) {
      throw new Error('Invalid sign-up response');
    }
    return new User(response.id, response.username, response.role);
  }
}
