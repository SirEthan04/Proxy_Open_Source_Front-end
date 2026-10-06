import { UserRole } from './user-role';

export class User {
  constructor(
    readonly id: number,
    readonly username: string,
    readonly role: UserRole,
  ) {}
}
