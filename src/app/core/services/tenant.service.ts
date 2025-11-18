// src/app/core/services/tenant.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {CreateTenantRequest} from '../models/tenents/tenant-request';
import {TenantDetailResponse} from '../models/tenents/tenent-detail-response';
import {TenantResponse} from '../models/tenents/tenant-response';
import {UpdateTenantRequest} from '../models/tenents/update-tenant-request';


@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tenants`;

  createTenant(request: CreateTenantRequest): Observable<TenantDetailResponse> {
    return this.http.post<TenantDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllTenants(includeInactive: boolean = false): Observable<TenantResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<TenantResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getTenantById(id: string): Observable<TenantDetailResponse> {
    return this.http.get<TenantDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateTenant(id: string, request: UpdateTenantRequest): Observable<TenantDetailResponse> {
    return this.http.put<TenantDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteTenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchTenantsByName(name: string): Observable<TenantResponse[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<TenantResponse[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }


  getTenantByPhone(phone: string): Observable<TenantDetailResponse> {
    const params = new HttpParams().set('phone', phone);
    return this.http.get<TenantDetailResponse>(`${this.apiUrl}/by-phone`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getActiveTenants(): Observable<TenantResponse[]> {
    return this.http.get<TenantResponse[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Tenant Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
