
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './auth-interceptor';

// NEW DIAGNOSTIC LOGS START HERE
console.log('AppConfig: Evaluating app.config.ts');
console.log('AppConfig: `routes` object imported. Length:', routes.length);
const setupRoute = routes.find(r => r.path === 'setup');
const dashboardRoute = routes.find(r => r.path === 'dashboard');
console.log('AppConfig: `routes` object content for /setup:', JSON.stringify({
  path: setupRoute?.path,
  canActivate: setupRoute?.canActivate ? 'YES' : 'NO',
  guardReferenceName: 'xxx', //setupRoute?.canActivate?.[0]?.name // Get the name of the guard function
}));
console.log('AppConfig: `routes` object content for /dashboard:', JSON.stringify({
  path: dashboardRoute?.path,
  canActivate: dashboardRoute?.canActivate ? 'YES' : 'NO',
  guardReferenceName: 'xxx', //dashboardRoute?.canActivate?.[0]?.name
}));
// NEW DIAGNOSTIC LOGS END HERE

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};
