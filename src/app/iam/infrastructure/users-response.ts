import { UserRole } from '../domain/model/user-role';

export interface UserResponse {
  readonly id: number;
  readonly username: string;
  readonly role: UserRole;
}
