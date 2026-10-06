import { computed, Service, signal } from '@angular/core';
import { Session } from '../domain/model/session';

@Service()
export class IamSession {
  private readonly state = signal<Session | null>(null);
  readonly session = this.state.asReadonly();
  readonly user = computed(() => this.state()?.user ?? null);
  readonly token = computed(() => this.state()?.token ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isAdministrator = computed(() => this.role() === 'administrator');
  readonly isEmployee = computed(() => this.role() === 'employee');

  set(session: Session): void {
    this.state.set(session);
  }

  clear(): void {
    this.state.set(null);
  }
}
