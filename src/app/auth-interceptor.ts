import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken(); // This will trigger the more detailed log in AuthService

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log(`AuthInterceptor: Adding Authorization header to request for ${req.url.substring(0, 50)}...`); // Simplified log
    return next(authReq);
  }

  console.log(`AuthInterceptor: No token found for request to ${req.url.substring(0, 50)}...`); // Simplified log
  return next(req);
};
