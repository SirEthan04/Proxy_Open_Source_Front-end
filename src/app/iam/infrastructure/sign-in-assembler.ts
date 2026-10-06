import { SignInCommand } from '../domain/model/sign-in.command';
import { Session } from '../domain/model/session';
import { User } from '../domain/model/user.entity';
import { isUserRole } from '../domain/model/user-role';
import { SignInRequest } from './sign-in.request';
import { SignInResponse } from './sign-in-response';

export class SignInAssembler {
  static toRequest(command: SignInCommand): SignInRequest {
    return { username: command.username.trim(), password: command.password };
  }

  static toSession(response: SignInResponse): Session {
    if (
      !Number.isInteger(response.id) ||
      typeof response.username !== 'string' ||
      !response.username.trim() ||
      typeof response.token !== 'string' ||
      !response.token.trim() ||
      /\s/.test(response.token) ||
      !isUserRole(response.role)
    ) {
      throw new Error('Invalid sign-in response');
    }
    return { user: new User(response.id, response.username, response.role), token: response.token };
  }
}
