import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth.guard'; // Ensure 'authGuard' is imported as a function

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: Login },
  { path: 'auth/register', loadComponent: () => import('./auth/register/register').then(m => m.Register) },
  {
    path: 'setup',
    loadComponent: () => import('./setup/setup').then(m => m.Setup),
    canActivate: [authGuard] // Use the functional guard
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard] // Use the functional guard
  },
  {
    path: 'quarters',
    loadComponent: () => import('./quarters/quarters').then(m => m.Quarters), // Lazy load Quarters component
    canActivate: [authGuard] // Use the functional guard
  },
  {
    path: 'quarters/new',
    loadComponent: () => import('./quarters/quarter-form/quarter-form').then(m => m.QuarterForm), // Lazy load QuarterForm
    canActivate: [authGuard] // Use the functional guard
  },
  {
    path: 'quarters/edit/:id', // Route for editing an existing quarter
    loadComponent: () => import('./quarters/quarter-form/quarter-form').then(m => m.QuarterForm), // Lazy load QuarterForm
    canActivate: [authGuard] // Use the functional guard
  },
  { path: '**', redirectTo: 'auth/login' } // Wildcard route for any unmatched URLs
];
