// src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { LoginRequest } from '../models/auth/login-request.model';
import { RegisterRequest } from '../models/auth/register-request.model';
import { RefreshTokenRequest } from '../models/auth/refresh-token-request.model';
import { AuthResponse, UserDto } from '../models/auth/auth-response.model';
import {environment} from '../../../enviroment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth`;

  currentUser = signal<UserDto | null>(null);
  isAuthenticated = computed(() => {
    return !!this.currentUser() && !!this.storage.getToken();
  });

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const user = this.storage.getUser();
    const token = this.storage.getToken();

    if (user && token) {
      this.currentUser.set(user);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, request).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.storage.setRefreshToken(response.refreshToken);
      }),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    const token = this.storage.getToken();

    return this.http.post<void>(`${this.API_URL}/logout`, null, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => this.handleLogout()),
      catchError(() => {
        this.handleLogout();
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storage.setToken(response.token);
    this.storage.setRefreshToken(response.refreshToken);
    this.storage.setUser(response.user);
    this.currentUser.set(response.user);
  }

  private handleLogout(): void {
    this.storage.clear();
    this.currentUser.set(null);
    //this.themeService.resetTheme();
  }

  private handleAuthError(error: any): Observable<never> {
    console.error('Auth error:', error);
    return throwError(() => error);
  }
}
