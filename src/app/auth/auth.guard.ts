import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../core/services/auth';
import { Observable, map, take, combineLatest, filter } from 'rxjs'; // 🛑 Import combineLatest and filter

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // NEW: Combine isAuthenticated$ with isAuthServiceReady$ to ensure the service has finished loading
  return combineLatest([
    authService.isAuthServiceReady$.pipe(filter(ready => ready), take(1)), // Wait until the service is ready
    authService.isAuthenticated$.pipe(take(1)) // Then take the current authentication status
  ]).pipe(
    map(([_, isAuthenticated]) => { // We only care about isAuthenticated from the second observable
      console.log(`AuthGuard (combineLatest map): isAuthenticated$ value: ${isAuthenticated}`);

      if (isAuthenticated) {
        console.log(`AuthGuard (combineLatest map): isAuthenticated is TRUE. Allowing access to ${state.url}.`);
        return true;
      } else {
        console.log('AuthGuard (combineLatest map): isAuthenticated$ value: false');
        console.log('AuthGuard (combineLatest map): isAuthenticated is FALSE. Redirecting to login.');
        const redirectUrlTree = router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
        console.log('AuthGuard: Redirecting to:', redirectUrlTree.toString()); // Added for debugging
        return redirectUrlTree;
      }
    })
  );
};
