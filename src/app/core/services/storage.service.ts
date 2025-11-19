import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'rentmaster_token';
  private readonly REFRESH_TOKEN_KEY = 'rentmaster_refresh_token';
  private readonly USER_KEY = 'rentmaster_user';
  private readonly THEME_KEY = 'rentmaster_theme';
  private readonly ORG_THEME_KEY = 'rentmaster_org_theme';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // User management
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Theme management
  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(this.THEME_KEY) as 'light' | 'dark') || 'light';
  }

  // Organization theme
  setOrgTheme(theme: any): void {
    localStorage.setItem(this.ORG_THEME_KEY, JSON.stringify(theme));
  }

  getOrgTheme(): any {
    const theme = localStorage.getItem(this.ORG_THEME_KEY);
    return theme ? JSON.parse(theme) : null;
  }

  // Clear all
  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ORG_THEME_KEY);
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
