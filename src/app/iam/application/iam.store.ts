import { HttpErrorResponse } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SignInCommand } from '../domain/model/sign-in.command';
import { SignUpCommand } from '../domain/model/sign-up.command';
import { User } from '../domain/model/user.entity';
import { IamApi } from '../infrastructure/iam-api';
import { IamSession } from './iam-session';

export type IamError =
  'invalid-credentials' | 'username-taken' | 'network' | 'invalid-input' | 'unexpected';

@Service()
export class IamStore {
  private readonly api = inject(IamApi);
  private readonly sessionState = inject(IamSession);
  private readonly pending = signal(false);
  private readonly failure = signal<IamError | null>(null);
  private operation = 0;

  readonly user = this.sessionState.user;
  readonly isAuthenticated = this.sessionState.isAuthenticated;
  readonly role = this.sessionState.role;
  readonly isAdministrator = this.sessionState.isAdministrator;
  readonly isEmployee = this.sessionState.isEmployee;
  readonly loading = this.pending.asReadonly();
  readonly error = this.failure.asReadonly();

  async signIn(command: SignInCommand): Promise<boolean> {
    return (
      (await this.execute(command, async () => {
        const session = await firstValueFrom(this.api.signIn(command));
        return () => {
          this.sessionState.set(session);
          return true;
        };
      })) ?? false
    );
  }

  async signUp(command: SignUpCommand): Promise<User | null> {
    return this.execute(command, async () => {
      const user = await firstValueFrom(this.api.signUp(command));
      return () => user;
    });
  }

  signOut(): void {
    this.operation++;
    this.sessionState.clear();
    this.pending.set(false);
    this.failure.set(null);
  }

  private async execute<T>(
    command: SignInCommand | SignUpCommand,
    request: () => Promise<() => T>,
  ): Promise<T | null> {
    if (this.pending()) return null;
    this.failure.set(null);
    if (!command.username.trim() || !command.password) {
      this.failure.set('invalid-input');
      return null;
    }
    const operation = ++this.operation;
    this.pending.set(true);
    try {
      const commit = await request();
      return operation === this.operation ? commit() : null;
    } catch (error: unknown) {
      if (operation === this.operation) this.failure.set(this.errorCode(error));
      return null;
    } finally {
      if (operation === this.operation) this.pending.set(false);
    }
  }

  private errorCode(error: unknown): IamError {
    if (!(error instanceof HttpErrorResponse)) return 'unexpected';
    switch (error.status) {
      case 0:
        return 'network';
      case 400:
      case 422:
        return 'invalid-input';
      case 401:
        return 'invalid-credentials';
      case 409:
        return 'username-taken';
      default:
        return 'unexpected';
    }
  }
}
