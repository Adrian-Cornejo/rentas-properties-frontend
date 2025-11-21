// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../../enviroment/environment';
import { AuthResponse, UserResponse } from '../models/auth/auth-response.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { LoginRequest } from '../models/auth/login-request.model';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request.model';
import { OrganizationInfoResponse } from '../models/organization/organization-info-response';
import { OrganizationService } from './organization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly organizationService = inject(OrganizationService);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals
  private readonly _currentUser = signal<UserResponse | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  organizationInfo = signal<OrganizationInfoResponse | null>(null);

  // Read-only accessors
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    this.loadUserFromStorage();
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        this.loadOrganizationInfo();
      }),
      catchError(this.handleError)
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        this.loadOrganizationInfo();
      }),
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
      tap(response => {
        this.handleAuthResponse(response);
        this.loadOrganizationInfo();
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      finalize(() => {
        this.clearAuthData();
      }),
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

  loadOrganizationInfo(): void {
    this.organizationService.getMyOrganizationInfo().subscribe({
      next: (info) => {
        this.organizationInfo.set(info);
        console.log('Información de organización cargada:', info.name);
      },
      error: (error) => {
        console.log('Usuario sin organización o error al cargar:', error.message);
        this.organizationInfo.set(null);
      }
    });
  }

  reloadOrganizationInfo(): void {
    this.loadOrganizationInfo();
  }

  getToken(): string | null {
    return localStorage.getItem('rentmaster_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('rentmaster_refresh_token');
  }

  hasRole(role: 'ADMIN' | 'OWNER' | 'USER'): boolean {
    return this._currentUser()?.role === role;
  }

  hasAnyRole(roles: ('ADMIN' | 'OWNER' | 'USER')[]): boolean {
    const userRole = this._currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  hasOrganization(): boolean {
    return this.organizationInfo() !== null;
  }

  getSubscriptionPlan(): 'BASICO' | 'INTERMEDIO' | 'SUPERIOR' | null {
    return this.organizationInfo()?.subscriptionPlan || null;
  }

  canAddMoreProperties(): boolean {
    const info = this.organizationInfo();
    if (!info) return false;
    return info.currentPropertiesCount < info.maxProperties;
  }

  canAddMoreUsers(): boolean {
    const info = this.organizationInfo();
    if (!info) return false;
    return info.currentUsersCount < info.maxUsers;
  }

  getMaxProperties(): number {
    return this.organizationInfo()?.maxProperties || 0;
  }

  getMaxUsers(): number {
    return this.organizationInfo()?.maxUsers || 0;
  }

  updateCurrentUser(user: UserResponse): void {
    this._currentUser.set(user);
    const token = localStorage.getItem('access_token');
    if (token) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('rentmaster_token', response.token);
    localStorage.setItem('rentmaster_refresh_token', response.refreshToken);
    localStorage.setItem('rentmaster_user', JSON.stringify(response.user));

    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);
  }

  private clearAuthData(): void {

    localStorage.removeItem('rentmaster_token');
    localStorage.removeItem('rentmaster_refresh_token');
    localStorage.removeItem('rentmaster_user');

    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.organizationInfo.set(null);


    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('rentmaster_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserResponse;
        this._currentUser.set(user);
        this._isAuthenticated.set(true);

        this.loadOrganizationInfo();
      } catch (error) {
        console.error('Error loading user from storage:', error);
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
