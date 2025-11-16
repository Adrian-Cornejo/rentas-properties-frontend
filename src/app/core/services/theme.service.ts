import { Injectable, signal, effect } from '@angular/core';
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
  readonly isDarkMode = signal<boolean>(false);
  readonly currentTheme = signal<OrganizationTheme | null>(null);

  constructor(private storage: StorageService) {
    this.initializeTheme();
    this.setupThemeWatcher();
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

  private setupThemeWatcher(): void {
    // Escuchar cambios en preferencias del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.storage.getTheme()) {
        this.setDarkMode(e.matches);
      }
    });
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

    const root = document.documentElement;

    if (theme.primaryColor) {
      this.applyColorPalette('primary', theme.primaryColor);
    }

    if (theme.secondaryColor) {
      this.applyColorPalette('secondary', theme.secondaryColor);
    }

    if (theme.logoUrl) {
      root.style.setProperty('--org-logo-url', `url(${theme.logoUrl})`);
    }

    if (theme.organizationName) {
      root.style.setProperty('--org-name', `"${theme.organizationName}"`);
    }
  }

  private applyColorPalette(prefix: string, baseColor: string): void {
    const root = document.documentElement;
    const palette = this.generateColorPalette(baseColor);

    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${prefix}-${key}`, value);
    });
  }

  private generateColorPalette(hexColor: string): Record<string, string> {
    // Convertir HEX a RGB
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return {};

    const { r, g, b } = rgb;

    // Generar paleta de 50 a 900
    return {
      '50': this.rgbToOklch(r * 0.95 + 255 * 0.05, g * 0.95 + 255 * 0.05, b * 0.95 + 255 * 0.05),
      '100': this.rgbToOklch(r * 0.9 + 255 * 0.1, g * 0.9 + 255 * 0.1, b * 0.9 + 255 * 0.1),
      '200': this.rgbToOklch(r * 0.8 + 255 * 0.2, g * 0.8 + 255 * 0.2, b * 0.8 + 255 * 0.2),
      '300': this.rgbToOklch(r * 0.7 + 255 * 0.3, g * 0.7 + 255 * 0.3, b * 0.7 + 255 * 0.3),
      '400': this.rgbToOklch(r * 0.85, g * 0.85, b * 0.85),
      '500': this.rgbToOklch(r, g, b), // Color base
      '600': this.rgbToOklch(r * 0.85, g * 0.85, b * 0.85),
      '700': this.rgbToOklch(r * 0.7, g * 0.7, b * 0.7),
      '800': this.rgbToOklch(r * 0.55, g * 0.55, b * 0.55),
      '900': this.rgbToOklch(r * 0.4, g * 0.4, b * 0.4),
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
      : null;
  }

  private rgbToOklch(r: number, g: number, b: number): string {
    // Normalizar a 0-1
    r = Math.max(0, Math.min(255, r)) / 255;
    g = Math.max(0, Math.min(255, g)) / 255;
    b = Math.max(0, Math.min(255, b)) / 255;

    // Convertir a linear RGB
    r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Calcular luminancia aproximada (simplificado)
    const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Calcular chroma aproximado
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    // Calcular hue aproximado
    let hue = 0;
    if (chroma !== 0) {
      if (max === r) {
        hue = ((g - b) / chroma) % 6;
      } else if (max === g) {
        hue = (b - r) / chroma + 2;
      } else {
        hue = (r - g) / chroma + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    // Convertir a OKLCH (aproximado)
    const l = Math.sqrt(lightness) * 100;
    const c = chroma * 0.4;

    return `oklch(${(l / 100).toFixed(2)} ${c.toFixed(2)} ${hue.toFixed(0)})`;
  }

  clearOrganizationTheme(): void {
    this.currentTheme.set(null);
    this.storage.setOrgTheme(null);

    const root = document.documentElement;

    // Remover todas las variables personalizadas
    ['primary', 'secondary'].forEach(prefix => {
      ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach(shade => {
        root.style.removeProperty(`--color-${prefix}-${shade}`);
      });
    });

    root.style.removeProperty('--org-logo-url');
    root.style.removeProperty('--org-name');
  }

  getOrganizationTheme(): OrganizationTheme | null {
    return this.currentTheme();
  }
}
