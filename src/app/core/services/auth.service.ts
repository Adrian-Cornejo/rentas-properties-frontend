// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {AuthResponse, UserResponse} from '../models/auth/auth-response.model';
import {RegisterRequest} from '../models/auth/register-request.model';
import {LoginRequest} from '../models/auth/login-request.model';
import {RefreshTokenRequest} from '../models/auth/refresh-token-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<UserResponse | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuthData()),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  validateToken(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate`).pipe(
      catchError(() => {
        this.clearAuthData();
        return throwError(() => new Error('Invalid token'));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  hasRole(role: 'ADMIN' | 'OWNER' | 'USER'): boolean {
    return this._currentUser()?.role === role;
  }

  hasAnyRole(roles: ('ADMIN' | 'OWNER' | 'USER')[]): boolean {
    const userRole = this._currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(response.user));

    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');

    this._currentUser.set(null);
    this._isAuthenticated.set(false);

    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('current_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserResponse;
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
