// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './shared/components/auth-layout/auth-layout';
import { DashboardLayoutComponent } from './shared/components/dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
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
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/dashboard/properties/properties').then(m => m.PropertiesComponent)
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/dashboard/tenants/tenants').then(m => m.TenantsComponent)
      },
      {
        path: 'contracts',
        loadComponent: () => import('./features/dashboard/contracts/contracts').then(m => m.ContractsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/dashboard/payments/payments').then(m => m.PaymentsComponent)
      },
      {
        path: 'maintenance',
        loadComponent: () => import('./features/dashboard/maintenance/maintenance').then(m => m.MaintenanceComponent)
      },
      {
        path: 'organization',
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
    redirectTo: '/auth/login'
  }
];
