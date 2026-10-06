import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamSession } from '../application/iam-session';
import { IAM_CONFIG } from './iam.config';

export const iamGuard: CanActivateFn = (_route, state) => {
  const session = inject(IamSession);
  const router = inject(Router);
  const config = inject(IAM_CONFIG);
  return (
    session.isAuthenticated() ||
    router.createUrlTree([config.signInRoute], {
      queryParams: { returnUrl: state.url },
    })
  );
};
