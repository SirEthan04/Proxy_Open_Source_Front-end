import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { IamSession } from '../application/iam-session';
import { IAM_CONFIG, iamEndpoint, isIamApiUrl } from './iam.config';

export const iamInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(IAM_CONFIG);
  const session = inject(IamSession);
  const token = session.token();
  const url = request.url.split(/[?#]/)[0];
  const isAuthentication = [config.signInPath, config.signUpPath].some(
    (path) => url === iamEndpoint(config, path),
  );
  if (
    !token ||
    !isIamApiUrl(request.url, config) ||
    isAuthentication ||
    request.headers.has('Authorization')
  ) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && session.token() === token) {
        session.clear();
      }
      return throwError(() => error);
    }),
  );
};
