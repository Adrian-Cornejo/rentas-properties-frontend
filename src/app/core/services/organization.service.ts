// src/app/core/services/organization.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {environment} from '../../../enviroment/environment';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  invitationCode: string;
  maxUsers: number;
  maxProperties: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/organizations`;

  currentOrganization = signal<Organization | null>(null);

  loadOrganization(id: string): void {
    this.http.get<Organization>(`${this.API_URL}/${id}`).subscribe({
      next: (org) => {
        this.currentOrganization.set(org);
        this.applyOrganizationTheme(org);
      },
      error: (error) => {
        console.error('Error loading organization:', error);
      }
    });
  }

  private applyOrganizationTheme(org: Organization): void {
    if (org.primaryColor) {
      document.documentElement.style.setProperty('--primary-500', org.primaryColor);
    }
    if (org.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-500', org.secondaryColor);
    }
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.API_URL}/${id}`);
  }
}
