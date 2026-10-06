import '@angular/compiler';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { IamMockApi } from './iam-mock-api';
import { IamApi } from './iam-api';
import { SignInApiEndpoint } from './sign-in-api-endpoint';
import { SignUpApiEndpoint } from './sign-up-api-endpoint';
import { IamSession } from '../application/iam-session';
import { IamStore } from '../application/iam.store';

const credentials = { username: 'demo', password: 'demo123' };

function setup(db: unknown = { users: [{ id: 1, ...credentials, role: 'employee' }] }) {
  const http = { get: vi.fn(() => of(db)) };
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: http },
      { provide: IamMockApi, useFactory: () => new IamMockApi() },
      { provide: SignInApiEndpoint, useFactory: () => new SignInApiEndpoint() },
      { provide: SignUpApiEndpoint, useFactory: () => new SignUpApiEndpoint() },
      { provide: IamApi, useFactory: () => new IamApi() },
      { provide: IamSession, useFactory: () => new IamSession() },
    ],
  });
  const api = injector.get(IamMockApi);
  const store = runInInjectionContext(injector, () => new IamStore());
  return { api, store, http };
}

describe('JSON-backed IAM simulation', () => {
  it.each(['administrator', 'employee'] as const)(
    'distinguishes %s and clears the role on logout',
    async (role) => {
      const { store } = setup({ users: [{ id: 1, ...credentials, role }] });
      expect(store.role()).toBeNull();
      expect(await store.signIn(credentials)).toBe(true);
      expect(store.user()?.role).toBe(role);
      expect(store.role()).toBe(role);
      expect(store.isAdministrator()).toBe(role === 'administrator');
      expect(store.isEmployee()).toBe(role === 'employee');
      store.signOut();
      expect(store.role()).toBeNull();
      expect(store.isAdministrator()).toBe(false);
      expect(store.isEmployee()).toBe(false);
    },
  );

  it('registers only employees even when input includes an administrator role', async () => {
    const { store } = setup();
    const request = { username: 'new-user', password: 'demo123', role: 'administrator' };
    expect((await store.signUp(request))?.role).toBe('employee');
    expect(await store.signIn(request)).toBe(true);
    expect(store.isAdministrator()).toBe(false);
    expect(store.isEmployee()).toBe(true);
  });

  it.each(['owner', undefined])('rejects an invalid or missing role: %s', async (role) => {
    const { api } = setup({ users: [{ id: 1, ...credentials, role }] });
    await expect(firstValueFrom(api.signIn(credentials))).rejects.toThrow('Invalid users fixture');
  });

  it('signs in through the store using the JSON fixture without POST requests', async () => {
    const { store, http } = setup();
    expect(await store.signIn(credentials)).toBe(true);
    expect(store.user()?.username).toBe('demo');
    expect(store.user()).not.toHaveProperty('password');
    expect(http.get).toHaveBeenCalledWith(environment.mockDbUrl);
    store.signOut();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('registers in memory and allows a later sign-in', async () => {
    const { store } = setup();
    const registered = { username: 'new-user', password: 'fictional-password' };
    expect(await store.signUp(registered)).toEqual({
      id: 2,
      username: 'new-user',
      role: 'employee',
    });
    expect(store.isAuthenticated()).toBe(false);
    expect(await store.signIn(registered)).toBe(true);
  });

  it('rejects wrong passwords and unknown users', async () => {
    const { store } = setup();
    expect(await store.signIn({ ...credentials, password: 'wrong' })).toBe(false);
    expect(store.error()).toBe('invalid-credentials');
    expect(await store.signIn({ ...credentials, username: 'unknown' })).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('rejects duplicate usernames after trimming and ignoring case', async () => {
    const { store } = setup();
    expect(await store.signUp({ ...credentials, username: ' DEMO ' })).toBeNull();
    expect(store.error()).toBe('username-taken');
  });

  it('serializes concurrent registrations against the same in-memory users', async () => {
    const { api } = setup();
    const request = { username: 'new-user', password: 'fictional-password' };
    const results = await Promise.allSettled([
      firstValueFrom(api.signUp(request)),
      firstValueFrom(api.signUp(request)),
    ]);
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    if (results[1].status === 'rejected') {
      expect(results[1].reason).toBeInstanceOf(HttpErrorResponse);
      expect(results[1].reason.status).toBe(409);
    }
  });

  it('does not preserve registrations in a new simulator instance', async () => {
    const request = { username: 'new-user', password: 'fictional-password' };
    await firstValueFrom(setup().api.signUp(request));
    const { store } = setup();
    expect(await store.signIn(request)).toBe(false);
  });

  it('rejects a malformed users fixture', async () => {
    const { api } = setup({ users: [{ id: 1, username: 'demo' }] });
    await expect(firstValueFrom(api.signIn(credentials))).rejects.toThrow('Invalid users fixture');
  });
});
