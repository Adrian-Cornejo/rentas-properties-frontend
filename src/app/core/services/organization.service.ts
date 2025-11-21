// src/app/core/services/organization.service.ts
import {Injectable, inject, signal} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {CreateOrganizationRequest} from '../models/organization/organization-request';
import {OrganizationDetailResponse} from '../models/organization/organization-detail-response';
import {OrganizationResponse} from '../models/organization/organization-response';
import {UpdateOrganizationRequest} from '../models/organization/update-organization-request';
import {OrganizationStatsResponse} from '../models/organization/organization-stats-response';
import {OrganizationInfoResponse} from '../models/organization/organization-info-response';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/organizations`;
  currentOrganization = signal<OrganizationResponse | null>(null);

  createOrganization(request: CreateOrganizationRequest): Observable<OrganizationDetailResponse> {
    return this.http.post<OrganizationDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllOrganizations(): Observable<OrganizationResponse[]> {
    return this.http.get<OrganizationResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getMyOrganization(): Observable<OrganizationDetailResponse> {
    return this.http.get<OrganizationDetailResponse>(`${this.apiUrl}/me`).pipe(
      catchError(this.handleError)
    );
  }

  getOrganizationById(id: string): Observable<OrganizationDetailResponse> {
    return this.http.get<OrganizationDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  updateOrganization(id: string, request: UpdateOrganizationRequest): Observable<OrganizationDetailResponse> {
    return this.http.put<OrganizationDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  regenerateInvitationCode(id: string): Observable<OrganizationDetailResponse> {
    return this.http.post<OrganizationDetailResponse>(`${this.apiUrl}/${id}/regenerate-code`, {}).pipe(
      catchError(this.handleError)
    );
  }


  validateInvitationCode(code: string): Observable<OrganizationResponse> {
    const params = new HttpParams().set('code', code);
    return this.http.get<OrganizationResponse>(`${this.apiUrl}/validate-code`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getOrganizationStats(id: string): Observable<OrganizationStatsResponse> {
    return this.http.get<OrganizationStatsResponse>(`${this.apiUrl}/${id}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  getMyOrganizationStats(): Observable<OrganizationStatsResponse> {
    return this.http.get<OrganizationStatsResponse>(`${this.apiUrl}/me/stats`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveOrganizations(): Observable<OrganizationResponse[]> {
    return this.http.get<OrganizationResponse[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  getMyOrganizationInfo(): Observable<OrganizationInfoResponse> {
    return this.http.get<OrganizationInfoResponse>(`${this.apiUrl}/me/info`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {

    return throwError(() => new Error());
  }
}
