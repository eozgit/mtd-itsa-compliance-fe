
import { Routes } from '@angular/router';
import { Login } from './auth/login/login'; // Import 'Login' class from 'login.ts'

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: Login }, // Use 'Login' class
  { path: 'auth/register', loadComponent: () => import('./auth/register/register').then(m => m.Register) }, // Import 'Register' from 'register.ts'
  { path: 'setup', loadComponent: () => import('./setup/setup').then(m => m.Setup) }, // Import 'Setup' from 'setup.ts'
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) }, // Import 'Dashboard' from 'dashboard.ts'
];
