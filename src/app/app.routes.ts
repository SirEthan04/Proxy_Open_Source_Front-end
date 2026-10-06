import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/layout/layout';
import { inventoryRoutes } from './inventory/presentation/inventory.routes';
import { iamRoutes } from './iam/presentation/iam.routes';
import { iamGuard } from './iam/infrastructure/iam.guard';

export const routes: Routes = [
  ...iamRoutes,
  {
    path: '',
    component: Layout,
    canActivate: [iamGuard],
    children: [...inventoryRoutes],
  },
];
