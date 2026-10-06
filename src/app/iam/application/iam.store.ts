import { computed, inject, Injectable, signal } from '@angular/core';

import { User } from '../domain/model/user.entity';
import { SignInCommand } from '../domain/model/sign-in.command';
import { IamApi } from '../infrastructure/iam-api';

@Injectable({
  providedIn: 'root',
})
export class IamStore {
  private readonly iamApi = inject(IamApi);

  private readonly currentUserSignal = signal<User | null>(this.loadStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  readonly isEmployee = computed(() => this.currentUser()?.role === 'EMPLOYEE');

  private loadStoredUser(): User | null {
    const storedUser = localStorage.getItem('bodego_user');

    if (!storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      return new User(user.id, user.name, user.email, user.role);
    } catch {
      localStorage.removeItem('bodego_user');
      return null;
    }
  }

  signIn(command: SignInCommand, onSuccess?: () => void, onError?: () => void): void {
    this.iamApi.signIn(command).subscribe({
      next: (user) => {
        if (!user) {
          onError?.();
          return;
        }

        this.currentUserSignal.set(user);

        localStorage.setItem('bodego_user', JSON.stringify(user));

        onSuccess?.();
      },

      error: (error) => {
        console.error('Error signing in:', error);

        onError?.();
      },
    });
  }

  signOut(): void {
    this.currentUserSignal.set(null);

    localStorage.removeItem('bodego_user');
  }
}
