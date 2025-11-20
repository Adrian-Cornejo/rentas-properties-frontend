// src/app/shared/components/dashboard-layout/dashboard-layout.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { OrganizationService } from '../../../core/services/organization.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ButtonModule,
    TooltipModule,
    RouterLinkActive
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);

  // Signals
  isSidebarOpen = signal<boolean>(true);
  isMobileMenuOpen = signal<boolean>(false);
  isDarkMode = this.themeService.isDarkMode;
  currentUser = this.authService.currentUser;
  currentOrganization = this.organizationService.currentOrganization;

  // Computed
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  platformName = computed(() =>
    this.currentOrganization()?.name || 'RentMaster'
  );
  platformLogo = computed(() =>
    this.currentOrganization()?.logoUrl || '../../../../assets/logo.svg'
  );

  // Menu items
  readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard/home'
    },
    {
      label: 'Locaciones',
      icon: 'pi pi-map-marker',
      route: '/dashboard/locations'
    },
    {
      label: 'Propiedades',
      icon: 'pi pi-building',
      route: '/dashboard/properties'
    },
    {
      label: 'Inquilinos',
      icon: 'pi pi-users',
      route: '/dashboard/tenants'
    },
    {
      label: 'Contratos',
      icon: 'pi pi-file',
      route: '/dashboard/contracts'
    },
    {
      label: 'Pagos',
      icon: 'pi pi-dollar',
      route: '/dashboard/payments'
    },
    {
      label: 'Mantenimiento',
      icon: 'pi pi-wrench',
      route: '/dashboard/maintenance'
    },
    {
      label: 'Organización',
      icon: 'pi pi-cog',
      route: '/dashboard/organization',
      adminOnly: true
    }
  ];

  // Filtered menu items based on role
  visibleMenuItems = computed(() => {
    return this.menuItems.filter(item =>
      !item.adminOnly || this.isAdmin()
    );
  });

  ngOnInit(): void {
    this.loadOrganizationData();
  }

  private loadOrganizationData(): void {
    const user = this.currentUser();
    if (user?.organizationId) {
      this.organizationService.getOrganizationById(user.organizationId);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
