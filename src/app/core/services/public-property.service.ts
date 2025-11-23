import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../enviroment/environment';
import { PublicPropertyResponse } from '../models/properties/public-property-response';

@Injectable({
  providedIn: 'root'
})
export class PublicPropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/properties`;

  getPublicProperty(id: string): Observable<PublicPropertyResponse> {
    return this.http.get<PublicPropertyResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  generatePublicLink(propertyId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/property?id=${propertyId}`;
  }

  async copyPublicLink(propertyId: string): Promise<boolean> {
    try {
      const link = this.generatePublicLink(propertyId);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Error al copiar enlace:', error);
      return false;
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en servicio público de propiedades:', error);
    return throwError(() => error);
  }
}
