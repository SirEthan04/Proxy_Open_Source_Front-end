import { Routes } from '@angular/router';
import { Products } from './views/products/products';
import { Dashboard } from './views/dashboard/dashboard';

export const inventoryRoutes: Routes = [
  {
    path: 'lots',
    loadComponent: () => import('./views/lots/lots').then((module) => module.Lots),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: 'dashboard',
    component: Dashboard,
  },

  {
    path: 'products',
    component: Products,
  },
];
