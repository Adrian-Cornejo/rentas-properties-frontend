// src/app/core/services/contract.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {CreateContractRequest} from '../models/contract/contract-request';
import {ContractDetailResponse} from '../models/contract/contract-detail-response';
import {ContractResponse} from '../models/contract/contract-response';
import {UpdateContractRequest} from '../models/contract/update-contract';
import {UpdateDepositStatusRequest} from '../models/contract/update-deposit-status-request';
import {ContractSummaryResponse} from '../models/contract/contract-sumary-response';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contracts`;

  createContract(request: CreateContractRequest): Observable<ContractDetailResponse> {
    return this.http.post<ContractDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllContracts(includeInactive: boolean = false): Observable<ContractResponse[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<ContractResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getContractById(id: string): Observable<ContractDetailResponse> {
    return this.http.get<ContractDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getContractByNumber(contractNumber: string): Observable<ContractDetailResponse> {
    const params = new HttpParams().set('contractNumber', contractNumber);
    return this.http.get<ContractDetailResponse>(`${this.apiUrl}/by-number`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateContract(id: string, request: UpdateContractRequest): Observable<ContractDetailResponse> {
    return this.http.put<ContractDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getContractsByOrganization(organizationId: string): Observable<ContractResponse[]> {
    return this.http.get<ContractResponse[]>(`${this.apiUrl}/organization/${organizationId}`).pipe(
      catchError(this.handleError)
    );
  }

  getContractsByStatus(status: 'ACTIVO' | 'VENCIDO' | 'CANCELADO' | 'RENOVADO'): Observable<ContractResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ContractResponse[]>(`${this.apiUrl}/by-status`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getActiveContracts(): Observable<ContractResponse[]> {
    return this.http.get<ContractResponse[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  getExpiringContracts(days: number = 30): Observable<ContractResponse[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ContractResponse[]>(`${this.apiUrl}/expiring`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getContractsWithPendingDeposit(): Observable<ContractResponse[]> {
    return this.http.get<ContractResponse[]>(`${this.apiUrl}/pending-deposit`).pipe(
      catchError(this.handleError)
    );
  }


  getActiveContractByProperty(propertyId: string): Observable<ContractDetailResponse> {
    return this.http.get<ContractDetailResponse>(`${this.apiUrl}/property/${propertyId}/active`).pipe(
      catchError(this.handleError)
    );
  }

  updateDepositStatus(id: string, request: UpdateDepositStatusRequest): Observable<ContractDetailResponse> {
    return this.http.patch<ContractDetailResponse>(`${this.apiUrl}/${id}/deposit-status`, request).pipe(
      catchError(this.handleError)
    );
  }

  renewContract(id: string): Observable<ContractDetailResponse> {
    return this.http.post<ContractDetailResponse>(`${this.apiUrl}/${id}/renew`, {}).pipe(
      catchError(this.handleError)
    );
  }

  cancelContract(id: string): Observable<ContractDetailResponse> {
    return this.http.post<ContractDetailResponse>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getContractsSummary(): Observable<ContractSummaryResponse> {
    return this.http.get<ContractSummaryResponse>(`${this.apiUrl}/summary`).pipe(
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

    console.error('Contract Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
