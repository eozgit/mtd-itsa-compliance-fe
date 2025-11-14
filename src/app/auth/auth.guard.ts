import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/services/auth';
import { Observable, map, take } from 'rxjs'; // 🛑 Import Observable, map, and take
// authGuard.ts (Fully Corrected Version)
export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // The guard returns an Observable that completes after one emission (take(1))
  // This forces the Angular Router to WAIT for the AuthService state to settle.
  return authService.isAuthenticated$.pipe(
    take(1), // Get the current status and complete the stream
    map(isAuthenticated => {
      console.log('AuthGuard (Observable): isAuthenticated$', isAuthenticated);

      if (isAuthenticated) {
        return true; // Go to the protected route
      } else {
        console.log('AuthGuard (Observable): User not authenticated, creating UrlTree.');
        // Return a UrlTree object to trigger the redirection
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
      }
    })
  );
};
