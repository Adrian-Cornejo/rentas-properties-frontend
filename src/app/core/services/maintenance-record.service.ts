// src/app/core/services/maintenance-record.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {CreateMaintenanceRecordRequest} from '../models/maintenanceRecord/maintenance-record-request';
import {
  MaintenanceRecordDetailResponse,
  MaintenanceRecordSummaryResponse
} from '../models/maintenanceRecord/maintence-image';
import {MaintenanceRecordResponse} from '../models/maintenanceRecord/maintenance-record-response';
import {UpdateMaintenanceRecordRequest} from '../models/maintenanceRecord/update-maintenance-record-request';
import {AddMaintenanceImageRequest} from '../models/maintenanceRecord/add-maintence-image-request';


@Injectable({
  providedIn: 'root'
})
export class MaintenanceRecordService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/maintenance-records`;

  createMaintenanceRecord(request: CreateMaintenanceRecordRequest): Observable<MaintenanceRecordDetailResponse> {
    return this.http.post<MaintenanceRecordDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllMaintenanceRecords(): Observable<MaintenanceRecordResponse[]> {
    return this.http.get<MaintenanceRecordResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordById(id: string): Observable<MaintenanceRecordDetailResponse> {
    return this.http.get<MaintenanceRecordDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateMaintenanceRecord(id: string, request: UpdateMaintenanceRecordRequest): Observable<MaintenanceRecordDetailResponse> {
    return this.http.put<MaintenanceRecordDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteMaintenanceRecord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addImage(id: string, request: AddMaintenanceImageRequest): Observable<MaintenanceRecordDetailResponse> {
    const params = new HttpParams()
      .set('imageUrl', request.imageUrl)
      .set('imagePublicId', request.imagePublicId)
      .set('imageType', request.imageType)
      .set('description', request.description || '');

    return this.http.post<MaintenanceRecordDetailResponse>(`${this.apiUrl}/${id}/images`, {}, { params }).pipe(
      catchError(this.handleError)
    );
  }

  deleteImage(imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsByProperty(propertyId: string): Observable<MaintenanceRecordResponse[]> {
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/property/${propertyId}`).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsByContract(contractId: string): Observable<MaintenanceRecordResponse[]> {
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/contract/${contractId}`).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsByStatus(status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO'): Observable<MaintenanceRecordResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/by-status`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsByType(type: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA'): Observable<MaintenanceRecordResponse[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/by-type`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsByCategory(category: string): Observable<MaintenanceRecordResponse[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/by-category`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPendingMaintenanceRecords(): Observable<MaintenanceRecordResponse[]> {
    return this.http.get<MaintenanceRecordResponse[]>(`${this.apiUrl}/pending`).pipe(
      catchError(this.handleError)
    );
  }

  markAsCompleted(id: string, actualCost?: number): Observable<MaintenanceRecordDetailResponse> {
    const params = actualCost
      ? new HttpParams().set('actualCost', actualCost.toString())
      : new HttpParams();

    return this.http.post<MaintenanceRecordDetailResponse>(`${this.apiUrl}/${id}/complete`, {}, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getMaintenanceRecordsSummary(): Observable<MaintenanceRecordSummaryResponse> {
    return this.http.get<MaintenanceRecordSummaryResponse>(`${this.apiUrl}/summary`).pipe(
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

    console.error('Maintenance Record Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
