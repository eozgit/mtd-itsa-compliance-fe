
import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: Login },
  { path: 'auth/register', loadComponent: () => import('./auth/register/register').then(m => m.Register) },
  {
    path: 'setup',
    loadComponent: () => import('./setup/setup').then(m => m.Setup),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
];
