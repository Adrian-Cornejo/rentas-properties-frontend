// src/app/core/services/location.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {CreateLocationRequest} from '../models/location/location-request';
import {LocationDetailResponse} from '../models/location/location-detail-response';
import {LocationResponse} from '../models/location/location-response';
import {UpdateLocationRequest} from '../models/location/update-location-request';


@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/locations`;

  createLocation(request: CreateLocationRequest): Observable<LocationDetailResponse> {
    return this.http.post<LocationDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllLocations(includeInactive: boolean = false): Observable<LocationResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<LocationResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getLocationById(id: string): Observable<LocationDetailResponse> {
    return this.http.get<LocationDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateLocation(id: string, request: UpdateLocationRequest): Observable<LocationDetailResponse> {
    return this.http.put<LocationDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleLocationStatus(id: string): Observable<LocationDetailResponse> {
    return this.http.patch<LocationDetailResponse>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getLocationsByCity(city: string): Observable<LocationResponse[]> {
    const params = new HttpParams().set('city', city);
    return this.http.get<LocationResponse[]>(`${this.apiUrl}/by-city`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getLocationsByState(state: string): Observable<LocationResponse[]> {
    const params = new HttpParams().set('state', state);
    return this.http.get<LocationResponse[]>(`${this.apiUrl}/by-state`, { params }).pipe(
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

    console.error('Location Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
