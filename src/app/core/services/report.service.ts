// src/app/core/services/report.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FinancialReportRequest,
  OccupancyReportRequest,
  PaymentReportRequest,
  MaintenanceReportRequest,
  ExecutiveReportRequest
} from '../models/reports/report-requests';
import {
  FinancialReportResponse,
  OccupancyReportResponse,
  PaymentReportResponse,
  MaintenanceReportResponse,
  ExecutiveReportResponse
} from '../models/reports/report-responses';
import {environment} from '../../../enviroment/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  // ========================================
  // GENERACIÓN DE REPORTES
  // ========================================

  generateFinancialReport(request: FinancialReportRequest): Observable<FinancialReportResponse> {
    return this.http.post<FinancialReportResponse>(`${this.apiUrl}/financial`, request);
  }

  generateOccupancyReport(request: OccupancyReportRequest): Observable<OccupancyReportResponse> {
    return this.http.post<OccupancyReportResponse>(`${this.apiUrl}/occupancy`, request);
  }

  generatePaymentReport(request: PaymentReportRequest): Observable<PaymentReportResponse> {
    return this.http.post<PaymentReportResponse>(`${this.apiUrl}/payments`, request);
  }

  generateMaintenanceReport(request: MaintenanceReportRequest): Observable<MaintenanceReportResponse> {
    return this.http.post<MaintenanceReportResponse>(`${this.apiUrl}/maintenance`, request);
  }

  generateExecutiveReport(request: ExecutiveReportRequest): Observable<ExecutiveReportResponse> {
    return this.http.post<ExecutiveReportResponse>(`${this.apiUrl}/executive`, request);
  }

  // ========================================
  // EXPORTACIÓN
  // ========================================

  exportToPdf(reportType: string, reportData: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/pdf?reportType=${reportType}`, reportData, {
      responseType: 'blob'
    });
  }

  exportToExcel(reportType: string, reportData: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/excel?reportType=${reportType}`, reportData, {
      responseType: 'blob'
    });
  }

  // ========================================
  // EXPORTACIÓN CSV (LOCAL - FRONTEND)
  // ========================================

  exportToCsv(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Agregar headers
    csvRows.push(headers.join(','));

    // Agregar filas
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar comillas y comas
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ========================================
  // UTILIDADES
  // ========================================

  downloadPdfBlob(blob: Blob, filename: string): void {
    this.downloadFile(blob, `${filename}.pdf`);
  }

  downloadExcelBlob(blob: Blob, filename: string): void {
    this.downloadFile(blob, `${filename}.xlsx`);
  }
}
