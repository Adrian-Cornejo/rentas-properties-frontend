import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/auth-layout/auth-layout';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/home',
    pathMatch: 'full'
  },
  {
    path: 'public/property',
    loadComponent: () => import('./features/public/public-property-view/public-property-view').then(m => m.PublicPropertyViewComponent),
    title: 'Propiedad en Renta'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'locations',
        loadComponent: () => import('./features/dashboard/locations/locations').then(m => m.LocationsComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/locations/location-list/location-list').then(m => m.LocationListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/locations/location-form/location-form').then(m => m.LocationFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/dashboard/locations/location-form/location-form').then(m => m.LocationFormComponent)
          }
        ]
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/dashboard/properties/properties').then(m => m.PropertiesComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/properties/property-list/property-list').then(m => m.PropertyListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/properties/property-form/property-form').then(m => m.PropertyFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/dashboard/properties/property-form/property-form').then(m => m.PropertyFormComponent)
          }
        ]
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/dashboard/tenants/tenants').then(m => m.TenantsComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/tenants/tenant-list/tenant-list').then(m => m.TenantListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/tenants/tenant-form/tenant-form').then(m => m.TenantFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/dashboard/tenants/tenant-form/tenant-form').then(m => m.TenantFormComponent)
          }
        ]
      },
      {
        path: 'contracts',
        loadComponent: () => import('./features/dashboard/contracts/contracts').then(m => m.ContractsComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/contracts/contract-list/contract-list').then(m => m.ContractListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/contracts/contract-form/contract-form').then(m => m.ContractFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/dashboard/contracts/contract-form/contract-form').then(m => m.ContractFormComponent)
          }
        ]
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/dashboard/payments/payments').then(m => m.PaymentsComponent),
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/payments/payment-list/payment-list').then(m => m.PaymentListComponent)
          },
          {
            path: 'mark-paid/:id',
            loadComponent: () => import('./features/dashboard/payments/payment-form/payment-form').then(m => m.PaymentFormComponent)
          },
          {
            path: 'add-late-fee/:id',
            loadComponent: () => import('./features/dashboard/payments/payment-form/payment-form').then(m => m.PaymentFormComponent)
          }
        ]
      },
      {
        path: 'maintenance',
        loadComponent: () => import('./features/dashboard/maintenance/maintenance').then(m => m.MaintenanceComponent)
      },
      {
        path: 'organization',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/dashboard/organization/organization').then(m => m.OrganizationComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard/home'
  }
];
