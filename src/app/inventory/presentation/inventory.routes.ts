import { Routes } from '@angular/router';
import { Products } from './views/products/products';
import { Dashboard } from './views/dashboard/dashboard';
import { Movements } from './views/movements/movements';

export const inventoryRoutes: Routes = [
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
  { path: 'movements', component: Movements },
];
