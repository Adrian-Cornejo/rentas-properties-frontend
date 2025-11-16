import { Routes } from '@angular/router';
import {AuthLayoutComponent} from './shared/components/auth-layout/auth-layout';


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
  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  // },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
