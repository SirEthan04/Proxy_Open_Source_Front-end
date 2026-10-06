import { UserResponse } from './users-response';

export interface SignInResponse extends UserResponse {
  readonly token: string;
}
