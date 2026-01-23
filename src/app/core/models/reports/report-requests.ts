// src/app/core/models/reports/report-requests.ts

export interface FinancialReportRequest {
  startDate: string; // ISO format: 2024-01-01
  endDate: string;
  propertyId?: string;
  locationId?: string;
  propertyType?: string;
}

export interface OccupancyReportRequest {
  startDate: string;
  endDate: string;
  locationId?: string;
  propertyType?: string;
}

export interface PaymentReportRequest {
  startDate: string;
  endDate: string;
  paymentStatus?: 'PENDIENTE' | 'PAGADO' | 'ATRASADO' | 'PARCIAL';
  propertyId?: string;
  contractId?: string;
}

export interface MaintenanceReportRequest {
  startDate: string;
  endDate: string;
  maintenanceType?: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA';
  status?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  propertyId?: string;
  category?: string;
}

export interface ExecutiveReportRequest {
  year: number;
  comparisonYear?: number;
  period?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2';
  locationId?: string;
}
