import { Component, inject, input } from '@angular/core';
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
  platformName = input<string>('RentMaster');
  logoUrl = input<string>('../../../../assets/logo.svg');

  isDarkMode = this.themeService.isDarkMode;

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
