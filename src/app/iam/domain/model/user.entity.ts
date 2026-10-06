export type UserRole = 'ADMIN' | 'EMPLOYEE';

export class User {
  constructor(
    public id: number = 0,
    public name: string = '',
    public email: string = '',
    public role: UserRole = 'EMPLOYEE',
  ) {}
}
