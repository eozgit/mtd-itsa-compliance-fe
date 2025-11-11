
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Import the generated API functions and models
import { apiAuthLoginPost } from '../api/fn/api/api-auth-login-post';
import { apiAuthRegisterPost } from '../api/fn/api/api-auth-register-post';
import { StrictHttpResponse } from '../api/strict-http-response';
import { RegisterRequest, LoginRequest } from '../api/models';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../api/api-configuration';

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

  constructor(
    private router: Router,
    private httpClient: HttpClient, // Inject HttpClient for generated functions
    private apiConfig: ApiConfiguration // Inject ApiConfiguration for generated functions
  ) {
    this.loadUserFromLocalStorage();
  }

  /**
   * Loads user and token from local storage on service initialization.
   */
  private loadUserFromLocalStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userString = localStorage.getItem(this.USER_KEY);

    if (token && userString) {
      try {
        const user: Omit<CurrentUser, 'token'> = JSON.parse(userString);
        const currentUser: CurrentUser = { ...user, token };
        this._currentUser.next(currentUser);
        this._isAuthenticated.next(true);
      } catch (e) {
        console.error('Failed to parse user data from local storage', e);
        this.clearSession();
      }
    } else {
      this.clearSession();
    }
  }

  /**
   * Stores the auth token and user data in local storage.
   * @param user The user object containing userId, userName, and token.
   */
  private saveSession(user: CurrentUser): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ userId: user.userId, userName: user.userName }));
    this._currentUser.next(user);
    this._isAuthenticated.next(true);
  }

  /**
   * Clears session data from local storage and resets observables.
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
  }

  /**
   * Registers a new user.
   * @param request The registration request payload.
   * @returns An observable of the AuthResponse.
   */
  register(request: RegisterRequest): Observable<CurrentUser> {
    return apiAuthRegisterPost(this.httpClient, this.apiConfig.rootUrl, request).pipe(
      map((response: StrictHttpResponse<any>) => { // 'any' because swagger spec doesn't explicitly define AuthResponse for register
        // Based on README.md & mtd-itsa.md, the response should be AuthResponse.
        // We'll cast it here, assuming the backend adheres to the spec.
        const authResponse = response.body as CurrentUser;
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
    return apiAuthLoginPost(this.httpClient, this.apiConfig.rootUrl, request).pipe(
      map((response: StrictHttpResponse<any>) => { // 'any' because swagger spec doesn't explicitly define AuthResponse for login
        // Based on README.md & mtd-itsa.md, the response should be AuthResponse.
        // We'll cast it here, assuming the backend adheres to the spec.
        const authResponse = response.body as CurrentUser;
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
    this.router.navigate(['/auth']); // Navigate to the auth page after logout
  }

  /**
   * Returns the current authentication token.
   */
  getToken(): string | null {
    return this._currentUser.value?.token || null;
  }
}
