// src/app/shared/components/dashboard-layout/dashboard-layout.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationDetailResponse } from '../../../core/models/organization/organization-detail-response';

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
  platformName = computed(() => {
    const orgName = this.currentOrganization()?.name;
    return orgName ? `${orgName} by RentMaster` : 'RentMaster';
  });
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
    if (!user?.organizationId) {
      return;
    }

    // 1. Intentar cargar desde localStorage primero (carga instantánea)
    const cachedOrg = this.loadOrganizationFromCache(user.organizationId);

    if (cachedOrg) {
      console.log('Organización cargada desde localStorage');
      this.organizationService.currentOrganization.set(cachedOrg);
      this.applyOrganizationTheme(cachedOrg);
    }

    // 2. SIEMPRE hacer petición al API para tener datos actualizados
    this.organizationService.getOrganizationById(user.organizationId).subscribe({
      next: (org) => {
        console.log('Organización actualizada desde API');
        this.organizationService.currentOrganization.set(org);
        this.saveOrganizationToCache(org);
        this.applyOrganizationTheme(org);
      },
      error: (err) => {
        console.error('Error al cargar organización:', err);
        // Si falla y hay caché, ya se aplicó arriba
        if (!cachedOrg) {
          console.warn('No hay datos en caché y falló la petición API');
        }
      }
    });
  }

  private loadOrganizationFromCache(organizationId: string): OrganizationDetailResponse | null {
    try {
      const cached = localStorage.getItem(`organization_${organizationId}`);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      const cacheTime = data.timestamp || 0;
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas

      // Si el caché expiró, eliminarlo y retornar null
      if (now - cacheTime > cacheExpiry) {
        localStorage.removeItem(`organization_${organizationId}`);
        return null;
      }

      return data.organization;
    } catch (error) {
      console.error('Error al cargar organización desde localStorage:', error);
      return null;
    }
  }

  private saveOrganizationToCache(organization: OrganizationDetailResponse): void {
    try {
      const cacheData = {
        organization,
        timestamp: Date.now()
      };
      localStorage.setItem(`organization_${organization.id}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error al guardar organización en localStorage:', error);
    }
  }

  private applyOrganizationTheme(organization: OrganizationDetailResponse): void {
    if (!organization) return;

    // Aplicar colores si existen
    if (organization.primaryColor || organization.secondaryColor) {
      const primaryColor = organization.primaryColor || '#3b82f6'; // default blue
      const secondaryColor = organization.secondaryColor || '#10b981'; // default green

      this.themeService.applyOrganizationTheme({
        primaryColor,
        secondaryColor,
        logoUrl: organization.logoUrl,
        organizationName: organization.name
      });

      console.log('Colores de organización aplicados:', { primaryColor, secondaryColor });
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
    // Limpiar caché de organización al cerrar sesión
    const user = this.currentUser();
    if (user?.organizationId) {
      localStorage.removeItem(`organization_${user.organizationId}`);
    }

    this.themeService.clearOrganizationTheme();

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
