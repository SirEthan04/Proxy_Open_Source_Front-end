import { Routes } from '@angular/router';

export const iamRoutes: Routes = [
  {
    path: 'sign-in',
    title: 'Iniciar sesión | BodeGo',
    loadComponent: () =>
      import('./views/sign-in-form/sign-in-form').then((module) => module.SignInForm),
  },
];
