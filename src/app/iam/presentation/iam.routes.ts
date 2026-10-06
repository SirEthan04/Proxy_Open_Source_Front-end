import { Routes } from '@angular/router';
import { SignInForm } from './views/sign-in-form/sign-in-form';

export const iamRoutes: Routes = [
  {
    path: 'sign-in',
    component: SignInForm,
  },
];
