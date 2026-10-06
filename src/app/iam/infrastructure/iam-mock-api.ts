import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SignInRequest } from './sign-in.request';
import { SignInResponse } from './sign-in-response';
import { SignUpRequest } from './sign-up.request';
import { SignUpResponse } from './sign-up-response';
import { isUserRole, UserRole } from '../domain/model/user-role';

interface MockUser {
  readonly id: number;
  readonly username: string;
  readonly password: string;
  readonly role: UserRole;
}

function isMockUser(value: unknown): value is MockUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    'username' in value &&
    typeof value.username === 'string' &&
    !!value.username.trim() &&
    'password' in value &&
    typeof value.password === 'string' &&
    !!value.password &&
    'role' in value &&
    isUserRole(value.role)
  );
}

// Demo only: public fixture credentials and in-memory registrations.
@Service()
export class IamMockApi {
  private readonly http = inject(HttpClient);
  private readonly users = signal<readonly MockUser[]>([]);
  private tokenSequence = 0;
  private readonly initialized = this.http.get<unknown>(environment.mockDbUrl).pipe(
    map((db) => {
      if (
        typeof db !== 'object' ||
        db === null ||
        !('users' in db) ||
        !Array.isArray(db.users) ||
        !db.users.every(isMockUser)
      ) {
        throw new Error('Invalid users fixture in db.json');
      }
      return db.users;
    }),
    tap((users) => this.users.set(users)),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  signIn(request: SignInRequest) {
    return this.initialized.pipe(
      map((): SignInResponse => {
        this.validate(request);
        const user = this.find(request.username);
        if (!user || user.password !== request.password) {
          throw new HttpErrorResponse({ status: 401, statusText: 'Invalid mock credentials' });
        }
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          token: `mock-session-${user.id}-${++this.tokenSequence}`,
        };
      }),
    );
  }

  signUp(request: SignUpRequest) {
    return this.initialized.pipe(
      map((): SignUpResponse => {
        this.validate(request);
        if (this.find(request.username)) {
          throw new HttpErrorResponse({ status: 409, statusText: 'Mock username already exists' });
        }
        const user: MockUser = {
          id: Math.max(0, ...this.users().map((entry) => entry.id)) + 1,
          username: request.username.trim(),
          password: request.password,
          role: 'employee',
        };
        this.users.update((users) => [...users, user]);
        return { id: user.id, username: user.username, role: user.role };
      }),
    );
  }

  private find(username: string): MockUser | undefined {
    const normalized = username.trim().toLowerCase();
    return this.users().find((user) => user.username.toLowerCase() === normalized);
  }

  private validate(request: SignInRequest | SignUpRequest): void {
    if (!request.username.trim() || !request.password) {
      throw new HttpErrorResponse({ status: 400, statusText: 'Invalid mock input' });
    }
  }
}
