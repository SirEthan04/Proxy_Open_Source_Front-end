import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/layout/layout';
import { inventoryRoutes } from './inventory/presentation/inventory.routes';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [...inventoryRoutes],
  },
];
