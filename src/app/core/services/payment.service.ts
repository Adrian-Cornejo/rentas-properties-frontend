// src/app/core/services/payment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {environment} from '../../../enviroment/environment';
import {PaymentDetailResponse} from '../models/payment/payment-detail-response';
import {CreatePaymentRequest} from '../models/payment/payment-request';
import {UpdatePaymentRequest} from '../models/payment/update-payment';
import {MarkAsPaidRequest} from '../models/payment/make-asi-paid-request';
import {AddLateFeeRequest} from '../models/payment/add-late-free-request';
import {PaymentSummaryResponse} from '../models/payment/payment-sumary-response';
import {PaymentResponse} from '../models/payment/payment-response';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  createPayment(request: CreatePaymentRequest): Observable<PaymentDetailResponse> {
    return this.http.post<PaymentDetailResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentById(id: string): Observable<PaymentDetailResponse> {
    return this.http.get<PaymentDetailResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updatePayment(id: string, request: UpdatePaymentRequest): Observable<PaymentDetailResponse> {
    return this.http.put<PaymentDetailResponse>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  markAsPaid(id: string, request: MarkAsPaidRequest): Observable<PaymentDetailResponse> {
    return this.http.post<PaymentDetailResponse>(`${this.apiUrl}/${id}/mark-as-paid`, request).pipe(
      catchError(this.handleError)
    );
  }

  addLateFee(id: string, request: AddLateFeeRequest): Observable<PaymentDetailResponse> {
    return this.http.post<PaymentDetailResponse>(`${this.apiUrl}/${id}/add-late-fee`, request).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentsByContract(contractId: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/contract/${contractId}`).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentsByStatus(status: 'PENDIENTE' | 'PAGADO' | 'ATRASADO' | 'PARCIAL'): Observable<PaymentResponse[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/by-status`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getPendingPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/pending`).pipe(
      catchError(this.handleError)
    );
  }

  getOverduePayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/overdue`).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentsDueToday(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/due-today`).pipe(
      catchError(this.handleError)
    );
  }


  getPaymentsByPeriod(year: number, month: number): Observable<PaymentResponse[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<PaymentResponse[]>(`${this.apiUrl}/by-period`, { params }).pipe(
      catchError(this.handleError)
    );
  }


  getPaymentsSummary(): Observable<PaymentSummaryResponse> {
    return this.http.get<PaymentSummaryResponse>(`${this.apiUrl}/summary`).pipe(
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

    console.error('Payment Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
