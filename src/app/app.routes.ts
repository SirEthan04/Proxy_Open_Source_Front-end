import { Routes } from '@angular/router';
import { inventoryRoutes } from './inventory/presentation/inventory.routes';
import { iamRoutes } from './iam/presentation/iam.routes';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  ...iamRoutes,
  ...inventoryRoutes,
];
