// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {UserResponse} from '../models/auth/auth-response.model';
import {UserDetailResponse} from '../models/user/user-detail-response';
import {UpdateUserRequest} from '../models/user/update-user-request';
import {JoinOrganizationRequest} from '../models/user/join-organization-request';
import {ChangeRoleRequest} from '../models/user/change-role-request';
import {ChangeAccountStatusRequest} from '../models/user/change-account-status-request';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAllUsers(includeInactive: boolean = false): Observable<UserResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<UserResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getCurrentUserProfile(): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.apiUrl}/me`).pipe(
      catchError(this.handleError)
    );
  }

  updateCurrentUserProfile(request: UpdateUserRequest): Observable<UserDetailResponse> {
    return this.http.put<UserDetailResponse>(`${this.apiUrl}/me`, request).pipe(
      catchError(this.handleError)
    );
  }

  joinOrganization(request: JoinOrganizationRequest): Observable<UserDetailResponse> {
    return this.http.post<UserDetailResponse>(`${this.apiUrl}/join-organization`, request).pipe(
      catchError(this.handleError)
    );
  }

  leaveOrganization(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/leave-organization`).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<UserDetailResponse> {
    return this.http.put<UserDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  toggleUserStatus(id: string): Observable<UserDetailResponse> {
    return this.http.patch<UserDetailResponse>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(
      catchError(this.handleError)
    );
  }

  changeUserRole(id: string, role: 'ADMIN' | 'OWNER' | 'USER'): Observable<UserDetailResponse> {
    const request: ChangeRoleRequest = { role };
    return this.http.patch<UserDetailResponse>(`${this.apiUrl}/${id}/role`, request).pipe(
      catchError(this.handleError)
    );
  }

  changeAccountStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Observable<UserDetailResponse> {
    const request: ChangeAccountStatusRequest = { status };
    return this.http.patch<UserDetailResponse>(`${this.apiUrl}/${id}/account-status`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getUsersByOrganization(organizationId: string, includeInactive: boolean = false): Observable<UserResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<UserResponse[]>(`${this.apiUrl}/organization/${organizationId}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getUsersWithoutOrganization(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/without-organization`).pipe(
      catchError(this.handleError)
    );
  }

  getUsersByAccountStatus(status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'): Observable<UserResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<UserResponse[]>(`${this.apiUrl}/by-account-status`, { params }).pipe(
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

    console.error('User Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
