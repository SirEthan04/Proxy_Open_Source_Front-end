import { User } from './user.entity';

export interface Session {
  readonly user: User;
  readonly token: string;
}
