import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';


export interface OrganizationTheme {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  organizationName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signals para reactividad
  isDarkMode = signal<boolean>(false);
  currentTheme = signal<OrganizationTheme | null>(null);

  constructor(private storage: StorageService) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Cargar tema del sistema o localStorage
    const savedTheme = this.storage.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.setDarkMode(isDark);

    // Cargar tema de organización si existe
    const orgTheme = this.storage.getOrgTheme();
    if (orgTheme) {
      this.applyOrganizationTheme(orgTheme);
    }
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
      this.storage.setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      this.storage.setTheme('light');
    }
  }

  applyOrganizationTheme(theme: OrganizationTheme): void {
    this.currentTheme.set(theme);
    this.storage.setOrgTheme(theme);

    // Aplicar colores personalizados
    const root = document.documentElement;

    if (theme.primaryColor) {
      const primaryColors = this.generateColorPalette(theme.primaryColor);
      Object.entries(primaryColors).forEach(([key, value]) => {
        root.style.setProperty(`--primary-${key}`, value);
      });
    }

    if (theme.secondaryColor) {
      const secondaryColors = this.generateColorPalette(theme.secondaryColor);
      Object.entries(secondaryColors).forEach(([key, value]) => {
        root.style.setProperty(`--secondary-${key}`, value);
      });
    }

    if (theme.logoUrl) {
      root.style.setProperty('--org-logo-url', `url(${theme.logoUrl})`);
    }

    if (theme.organizationName) {
      root.style.setProperty('--org-name', `"${theme.organizationName}"`);
    }
  }

  private generateColorPalette(baseColor: string): Record<string, string> {
    // Genera variantes del color base (50-900)
    // Por simplicidad, retornamos el mismo color
    // En producción, usarías una librería como color2k o chroma.js
    return {
      '50': this.lighten(baseColor, 0.95),
      '100': this.lighten(baseColor, 0.9),
      '200': this.lighten(baseColor, 0.75),
      '300': this.lighten(baseColor, 0.5),
      '400': this.lighten(baseColor, 0.25),
      '500': baseColor,
      '600': this.darken(baseColor, 0.1),
      '700': this.darken(baseColor, 0.2),
      '800': this.darken(baseColor, 0.3),
      '900': this.darken(baseColor, 0.4),
    };
  }

  private lighten(color: string, amount: number): string {
    // Implementación simple - en producción usar librería
    return color;
  }

  private darken(color: string, amount: number): string {
    // Implementación simple - en producción usar librería
    return color;
  }

  clearOrganizationTheme(): void {
    this.currentTheme.set(null);
    this.storage.setOrgTheme(null);

    // Restaurar colores por defecto
    const root = document.documentElement;
    root.style.removeProperty('--org-logo-url');
    root.style.removeProperty('--org-name');
  }
}
