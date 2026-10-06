import { UserRole } from '../domain/model/user.entity';

export interface SignInResponse {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
