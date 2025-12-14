
// src/app/core/services/notifications-http.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../enviroment/environment';
import { NotificationSettingsRequest } from '../models/notification/notification-settings-request';
import { NotificationSettingsResponse } from '../models/notification/notification-settings-response';
import { SendTestNotificationRequest } from '../models/notification/send-test-notification-request';
import { NotificationStatsResponse } from '../models/notification/notification-stats-response';

@Injectable({
  providedIn: 'root'
})
export class NotificationsHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  getSettings(): Observable<NotificationSettingsResponse> {
    return this.http.get<NotificationSettingsResponse>(`${this.apiUrl}/settings`).pipe(
      catchError(this.handleError)
    );
  }

  updateSettings(request: NotificationSettingsRequest): Observable<NotificationSettingsResponse> {
    return this.http.put<NotificationSettingsResponse>(`${this.apiUrl}/settings`, request).pipe(
      catchError(this.handleError)
    );
  }

  sendTestNotification(request: SendTestNotificationRequest): Observable<{ message: string; phoneNumber: string; channel: string }> {
    return this.http.post<{ message: string; phoneNumber: string; channel: string }>(
      `${this.apiUrl}/test`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  getStats(): Observable<NotificationStatsResponse> {
    return this.http.get<NotificationStatsResponse>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Error en NotificationsHttpService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
