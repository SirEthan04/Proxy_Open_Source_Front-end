import { Routes } from '@angular/router';
import { Products } from './views/products/products';

export const inventoryRoutes: Routes = [
  {
    path: 'products',
    component: Products,
  },
];
