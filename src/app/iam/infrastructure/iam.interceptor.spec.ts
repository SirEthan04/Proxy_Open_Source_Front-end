import '@angular/compiler';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { IamSession } from '../application/iam-session';
import { User } from '../domain/model/user.entity';
import { IAM_CONFIG, IamConfig } from './iam.config';
import { iamInterceptor } from './iam.interceptor';

const config: IamConfig = {
  apiBaseUrl: 'https://api.example.com/api/v1',
  signInPath: '/authentication/sign-in',
  signUpPath: '/authentication/sign-up',
  signInRoute: '/sign-in',
};

function setup() {
  const session = new IamSession();
  session.set({ user: new User(1, 'ethan', 'employee'), token: 'token' });
  const injector = Injector.create({
    providers: [
      { provide: IamSession, useValue: session },
      { provide: IAM_CONFIG, useValue: config },
    ],
  });
  return { session, injector };
}

describe('iamInterceptor', () => {
  it.each([
    ['https://api.example.com/api/v1/products', 'Bearer token'],
    ['https://external.example.com/products', null],
    ['https://api.example.com/api/v10/products', null],
    ['https://api.example.com/api/v1/authentication/sign-in', null],
    ['https://api.example.com/api/v1/authentication/sign-up', null],
  ])('scopes credentials for %s', async (url, authorization) => {
    const { injector } = setup();
    const next = vi.fn((_request: HttpRequest<unknown>) => of(new HttpResponse()));
    await firstValueFrom(
      runInInjectionContext(injector, () => iamInterceptor(new HttpRequest('GET', url), next)),
    );
    expect(next.mock.calls[0]?.[0].headers.get('Authorization')).toBe(authorization);
  });

  it('clears the rejected session on 401', async () => {
    const { injector, session } = setup();
    const next = () => throwError(() => new HttpErrorResponse({ status: 401 }));
    await expect(
      firstValueFrom(
        runInInjectionContext(injector, () =>
          iamInterceptor(new HttpRequest('GET', `${config.apiBaseUrl}/products`), next),
        ),
      ),
    ).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(session.isAuthenticated()).toBe(false);
  });
});
