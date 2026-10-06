import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Session } from '../domain/model/session';
import { User } from '../domain/model/user.entity';
import { IamApi } from '../infrastructure/iam-api';
import { IamSession } from './iam-session';
import { IamStore } from './iam.store';

const credentials = { username: 'ethan', password: 'secret' };
const session: Session = { user: new User(1, 'ethan', 'employee'), token: 'token' };

function setup() {
  const api = { signIn: vi.fn(() => of(session)), signUp: vi.fn(() => of(session.user)) };
  const injector = Injector.create({
    providers: [
      { provide: IamApi, useValue: api },
      { provide: IamSession, useFactory: () => new IamSession() },
    ],
  });
  const store = runInInjectionContext(injector, () => new IamStore());
  return { api, store };
}

describe('IamStore', () => {
  it('authenticates and clears the session on sign-out', async () => {
    const { store } = setup();
    expect(await store.signIn(credentials)).toBe(true);
    expect(store.user()).toEqual(session.user);
    expect(store.isAuthenticated()).toBe(true);
    store.signOut();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('does not restore a session when sign-in finishes after sign-out', async () => {
    const { api, store } = setup();
    const response = new Subject<Session>();
    api.signIn.mockReturnValue(response);
    const pending = store.signIn(credentials);
    expect(store.loading()).toBe(true);
    expect(await store.signIn(credentials)).toBe(false);
    expect(api.signIn).toHaveBeenCalledTimes(1);
    store.signOut();
    response.next(session);
    expect(await pending).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.loading()).toBe(false);
  });

  it('reports invalid credentials and releases loading state', async () => {
    const { api, store } = setup();
    api.signIn.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    expect(await store.signIn(credentials)).toBe(false);
    expect(store.error()).toBe('invalid-credentials');
    expect(store.loading()).toBe(false);
  });

  it('rejects empty credentials without an HTTP request', async () => {
    const { api, store } = setup();
    expect(await store.signIn({ username: ' ', password: 'secret' })).toBe(false);
    expect(store.error()).toBe('invalid-input');
    expect(api.signIn).not.toHaveBeenCalled();
  });

  it('registers without automatically opening a session', async () => {
    const { store } = setup();
    expect(await store.signUp(credentials)).toEqual(session.user);
    expect(store.isAuthenticated()).toBe(false);
  });
});
