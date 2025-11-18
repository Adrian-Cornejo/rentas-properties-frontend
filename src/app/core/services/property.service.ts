import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../enviroment/environment';
import {CreatePropertyRequest} from '../models/properties/property-request';
import {PropertyDetailResponse} from '../models/properties/property-detail-response';
import {PropertyResponse} from '../models/properties/property-response';
import {UpdatePropertyRequest} from '../models/properties/update-property-request';


@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/properties`;

  createProperty(request: CreatePropertyRequest): Observable<PropertyDetailResponse> {
    return this.http.post<PropertyDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllProperties(includeInactive: boolean = false): Observable<PropertyResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<PropertyResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPropertyById(id: string): Observable<PropertyDetailResponse> {
    return this.http.get<PropertyDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getPropertyByCode(code: string): Observable<PropertyDetailResponse> {
    const params = new HttpParams().set('code', code);
    return this.http.get<PropertyDetailResponse>(`${this.apiUrl}/by-code`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateProperty(id: string, request: UpdatePropertyRequest): Observable<PropertyDetailResponse> {
    return this.http.put<PropertyDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getPropertiesByStatus(status: 'DISPONIBLE' | 'RENTADA' | 'MANTENIMIENTO'): Observable<PropertyResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/by-status`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPropertiesByLocation(locationId: string): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/by-location/${locationId}`).pipe(
      catchError(this.handleError)
    );
  }

  getPropertiesByType(type: 'CASA' | 'DEPARTAMENTO' | 'LOCAL_COMERCIAL'): Observable<PropertyResponse[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/by-type`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getAvailableProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/available`).pipe(
      catchError(this.handleError)
    );
  }

  getRentedProperties(): Observable<PropertyResponse[]> {
    return this.http.get<PropertyResponse[]>(`${this.apiUrl}/rented`).pipe(
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

    console.error('Property Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
