
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ApiConfiguration } from './core/api/api-configuration'; // Corrected import: import the class directly

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(), // Provide HttpClient for API calls
    {
      provide: ApiConfiguration, // Provide the ApiConfiguration class itself
      useValue: { rootUrl: 'http://localhost:5129' } // Provide an object that matches its structure
    }
  ]
};
