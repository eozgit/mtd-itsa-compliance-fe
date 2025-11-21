import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

// Import the generated API functions and models
import { ApiConfiguration } from '../api/api-configuration';
import { RegisterRequest, LoginRequest } from '../api/models';
import { apiAuthLoginPost } from '../api/fn/api/api-auth-login-post';
import { apiAuthRegisterPost } from '../api/fn/api/api-auth-register-post';
import { StrictHttpResponse } from '../api/strict-http-response';

// Import the generated parameter types for the API functions
import { ApiAuthRegisterPost$Params } from '../api/fn/api/api-auth-register-post';
import { ApiAuthLoginPost$Params } from '../api/fn/api/api-auth-login-post';


// Define the shape of the user data we want to store
interface CurrentUser {
  userId: string;
  userName: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private _currentUser = new BehaviorSubject<CurrentUser | null>(null);
  public readonly currentUser$: Observable<CurrentUser | null> = this._currentUser.asObservable();

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$: Observable<boolean> = this._isAuthenticated.asObservable();

  // NEW: Subject to signal that initial loading from localStorage is complete
  private _isAuthServiceReady = new BehaviorSubject<boolean>(false);
  public readonly isAuthServiceReady$: Observable<boolean> = this._isAuthServiceReady.asObservable();

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private apiConfig: ApiConfiguration,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('AuthService constructor: isPlatformBrowser =', this.isBrowser);
    this.loadUserFromLocalStorage();
    // NEW: Signal that the AuthService has completed its initial setup
    this._isAuthServiceReady.next(true);
  }
  isAuthenticated(): boolean {
    const isAuthenticated = !!this._currentUser.value?.token;
    console.log(`AuthService.isAuthenticated() called. Current user has token: ${isAuthenticated}`);
    return isAuthenticated;
  }

  /**
   * Loads user and token from local storage on service initialization.
   */
  private loadUserFromLocalStorage(): void {
    if (!this.isBrowser) {
      console.log('AuthService.loadUserFromLocalStorage: Not in browser, skipping.');
      return;
    }
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userString = localStorage.getItem(this.USER_KEY);
    console.log('AuthService.loadUserFromLocalStorage: Attempting to load...');
    console.log(`AuthService.loadUserFromLocalStorage: RAW token from localStorage: ${token ? token.substring(0, 10) + '...' : 'null'}`);
    console.log(`AuthService.loadUserFromLocalStorage: RAW userString from localStorage: ${userString ? userString.substring(0, 10) + '...' : 'null'}`);
    console.log(`AuthService.loadUserFromLocalStorage: token (found?): ${!!token}, userString (found?): ${!!userString}`);

    if (token && userString) {
      try {
        const user: Omit<CurrentUser, 'token'> = JSON.parse(userString);
        const currentUser: CurrentUser = { ...user, token };
        this._currentUser.next(currentUser);
        this._isAuthenticated.next(true);
        console.log('AuthService: User and token LOADED from localStorage. CurrentUser Subject updated.');
        console.log('AuthService: Loaded token (first 10 chars):', token.substring(0, 10) + '...');
      } catch (e) {
        console.error('AuthService: Failed to parse user data from local storage', e);
        this.clearSession();
      }
    } else {
      console.log('AuthService: No complete user or token found in localStorage. Clearing session.');
      this.clearSession();
    }
  }

  /**
   * Stores the auth token and user data in local storage.
   * @param user The user object containing userId, userName, and token.
   */
  private saveSession(user: CurrentUser): void {
    console.log('AuthService: saveSession start, direct user object:', user); // NEW: Log direct object
    console.log('AuthService: saveSession start, JSON.stringify user:', JSON.stringify(user));
    if (!this.isBrowser) {
      console.log('AuthService.saveSession: Not in browser, skipping.');
      return;
    }

    console.log(`AuthService.saveSession: Token value to be stored: ${user.token ? user.token.substring(0, 10) + '...' : 'null'}`);

    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ userId: user.userId, userName: user.userName }));
    this._currentUser.next(user);
    this._isAuthenticated.next(true);
    console.log('AuthService: Token SAVED to localStorage. CurrentUser Subject updated.');

    const immediatelyRetrievedToken = localStorage.getItem(this.TOKEN_KEY);
    console.log('AuthService: Token in localStorage immediately after save (first 10 chars):', immediatelyRetrievedToken ? immediatelyRetrievedToken.substring(0, 10) + '...' : 'null');
  }

  /**
   * Clears session data from local storage and resets observables.
   */
  private clearSession(): void {
    if (!this.isBrowser) {
      console.log('AuthService.clearSession: Not in browser, skipping.');
      return;
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    console.log('AuthService: Session CLEARED from localStorage and subjects.');
  }

  /**
   * Registers a new user.
   * @param request The registration request payload.
   * @returns An observable of the AuthResponse.
   */
  register(request: RegisterRequest): Observable<CurrentUser> {
    console.log('AuthService register, request: ', request);
    const params: ApiAuthRegisterPost$Params = {
      body: request
    };
    return apiAuthRegisterPost(this.httpClient, this.apiConfig.rootUrl, params).pipe(
      map((response: StrictHttpResponse<any>) => {
        console.log('AuthService register map: Full API response object:', response);
        // Explicitly map properties from snake_case API response to camelCase CurrentUser interface
        const authResponse: CurrentUser = {
          userId: response.body.userId,
          userName: response.body.userName,
          token: response.body.token
        };
        console.log('AuthService register map: Constructed authResponse:', JSON.stringify(authResponse)); // NEW: Log constructed object
        this.saveSession(authResponse);
        return authResponse;
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs in an existing user.
   * @param request The login request payload.
   * @returns An observable of the AuthResponse.
   */
  login(request: LoginRequest): Observable<CurrentUser> {
    const params: ApiAuthLoginPost$Params = {
      body: request
    };
    return apiAuthLoginPost(this.httpClient, this.apiConfig.rootUrl, params).pipe(
      map((response: StrictHttpResponse<any>) => {
        console.log('AuthService register map: Full API response object:', response);
        // Explicitly map properties from snake_case API response to camelCase CurrentUser interface
        const authResponse: CurrentUser = {
          userId: response.body.userId,
          userName: response.body.userName,
          token: response.body.token
        };
        console.log('AuthService login map: Constructed authResponse:', JSON.stringify(authResponse)); // NEW: Log constructed object
        this.saveSession(authResponse);
        return authResponse;
      }),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user and navigates to the login page.
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Returns the current authentication token.
   */
  getToken(): string | null {
    const token = this._currentUser.value?.token || null;
    console.log(`AuthService.getToken() called. Current _currentUser subject has token: ${!!token}`);
    return token;
  }
}
