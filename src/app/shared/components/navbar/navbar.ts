import {Component, computed, inject, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {ThemeService} from '../../../core/services/theme.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private themeService = inject(ThemeService);


  showLogo = input<boolean>(true);
  showThemeToggle = input<boolean>(true);
  platformName = input<string>('ArriendaFacil');
  currentTheme = this.themeService.isDarkMode;
  logoUrl = computed(() => {

    if (this.currentTheme()) {
      return '/logo_dark.svg';
    } else {
      return '/logo_light.svg';
    }
  });

  isDarkMode = this.themeService.isDarkMode;

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
