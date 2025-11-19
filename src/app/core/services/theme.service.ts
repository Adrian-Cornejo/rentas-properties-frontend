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
  readonly isDarkMode = signal<boolean>(false);
  readonly currentTheme = signal<OrganizationTheme | null>(null);

  constructor(private storage: StorageService) {
    this.initializeTheme();
    this.setupThemeWatcher();
  }

  private initializeTheme(): void {
    const savedTheme = this.storage.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.setDarkMode(isDark);

    const orgTheme = this.storage.getOrgTheme();
    if (orgTheme) {
      this.applyOrganizationTheme(orgTheme);
    }
  }

  private setupThemeWatcher(): void {
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

  setOrganizationColors(primaryColor: string, secondaryColor: string): void {
    const theme = this.currentTheme();
    const updatedTheme: OrganizationTheme = {
      primaryColor,
      secondaryColor,
      logoUrl: theme?.logoUrl,
      organizationName: theme?.organizationName || 'RentMaster'
    };
    this.applyOrganizationTheme(updatedTheme);
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
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return {};

    const oklch = this.rgbToOklch(rgb.r, rgb.g, rgb.b);
    const [l, c, h] = this.parseOklch(oklch);

    return {
      '50': `oklch(${Math.min(0.98, l + 0.35).toFixed(2)} ${(c * 0.3).toFixed(2)} ${h})`,
      '100': `oklch(${Math.min(0.95, l + 0.30).toFixed(2)} ${(c * 0.5).toFixed(2)} ${h})`,
      '200': `oklch(${Math.min(0.90, l + 0.25).toFixed(2)} ${(c * 0.7).toFixed(2)} ${h})`,
      '300': `oklch(${Math.min(0.85, l + 0.15).toFixed(2)} ${(c * 0.85).toFixed(2)} ${h})`,
      '400': `oklch(${Math.min(0.75, l + 0.10).toFixed(2)} ${(c * 0.95).toFixed(2)} ${h})`,
      '500': oklch,
      '600': `oklch(${Math.max(0.35, l - 0.10).toFixed(2)} ${(c * 1.05).toFixed(2)} ${h})`,
      '700': `oklch(${Math.max(0.30, l - 0.15).toFixed(2)} ${(c * 0.95).toFixed(2)} ${h})`,
      '800': `oklch(${Math.max(0.25, l - 0.20).toFixed(2)} ${(c * 0.85).toFixed(2)} ${h})`,
      '900': `oklch(${Math.max(0.20, l - 0.25).toFixed(2)} ${(c * 0.75).toFixed(2)} ${h})`
    };
  }

  private parseOklch(oklchString: string): [number, number, number] {
    const matches = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (!matches) return [0.6, 0.15, 230];
    return [parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3])];
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToOklch(r: number, g: number, b: number): string {
    r = Math.max(0, Math.min(255, r)) / 255;
    g = Math.max(0, Math.min(255, g)) / 255;
    b = Math.max(0, Math.min(255, b)) / 255;

    r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

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

    const l = Math.sqrt(lightness) * 100;
    const c = chroma * 0.4;

    return `oklch(${(l / 100).toFixed(2)} ${c.toFixed(2)} ${hue.toFixed(0)})`;
  }

  clearOrganizationTheme(): void {
    this.currentTheme.set(null);
    this.storage.setOrgTheme(null);

    const root = document.documentElement;
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
