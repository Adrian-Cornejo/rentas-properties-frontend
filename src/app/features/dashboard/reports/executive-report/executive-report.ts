// src/app/features/dashboard/reports/executive-report/executive-report.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { PlanService } from '../../../../core/services/plan.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ExecutiveReportRequest } from '../../../../core/models/reports/report-requests';
import { ExecutiveReportResponse } from '../../../../core/models/reports/report-responses';

@Component({
  selector: 'app-executive-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './executive-report.html',
  styleUrl: './executive-report.css'
})
export class ExecutiveReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly planService = inject(PlanService);
  private readonly notification = inject(NotificationService);

  // ========================================
  // SIGNALS
  // ========================================

  isLoading = signal(false);
  isExporting = signal(false);
  reportData = signal<ExecutiveReportResponse | null>(null);

  // Paginación de tablas
  topPerformersPage = signal(1);
  worstPerformersPage = signal(1);
  pageSize = signal(5);

  // ========================================
  // FORM
  // ========================================

  filterForm!: FormGroup;

  // ========================================
  // OPCIONES
  // ========================================

  periods = [
    { label: 'Anual Completo', value: '' },
    { label: 'Q1 (Ene-Mar)', value: 'Q1' },
    { label: 'Q2 (Abr-Jun)', value: 'Q2' },
    { label: 'Q3 (Jul-Sep)', value: 'Q3' },
    { label: 'Q4 (Oct-Dic)', value: 'Q4' },
    { label: 'S1 (Ene-Jun)', value: 'S1' },
    { label: 'S2 (Jul-Dic)', value: 'S2' }
  ];

  // ========================================
  // PERMISOS DE EXPORTACIÓN
  // ========================================

  canExportCsv = computed(() => true);
  canExportPdf = computed(() => this.planService.hasFeature('PDF_REPORTS'));
  canExportExcel = computed(() => this.planService.hasFeature('DATA_EXPORT'));

  // ========================================
  // COMPUTED - DATOS DE TABLA PAGINADOS
  // ========================================

  paginatedTopPerformers = computed(() => {
    const data = this.reportData();
    if (!data?.propertyPerformance?.topPerformers) return [];

    const start = (this.topPerformersPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return data.propertyPerformance.topPerformers.slice(start, end);
  });

  paginatedWorstPerformers = computed(() => {
    const data = this.reportData();
    if (!data?.propertyPerformance?.worstPerformers) return [];

    const start = (this.worstPerformersPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return data.propertyPerformance.worstPerformers.slice(start, end);
  });

  topPerformersTotalPages = computed(() => {
    const data = this.reportData();
    if (!data?.propertyPerformance?.topPerformers) return 0;
    return Math.ceil(data.propertyPerformance.topPerformers.length / this.pageSize());
  });

  worstPerformersTotalPages = computed(() => {
    const data = this.reportData();
    if (!data?.propertyPerformance?.worstPerformers) return 0;
    return Math.ceil(data.propertyPerformance.worstPerformers.length / this.pageSize());
  });

  // ========================================
  // LIFECYCLE
  // ========================================

  ngOnInit(): void {
    this.initForm();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  private initForm(): void {
    const currentYear = new Date().getFullYear();

    this.filterForm = this.fb.group({
      year: [currentYear, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      comparisonYear: [currentYear - 1, [Validators.min(2000), Validators.max(2100)]],
      period: ['']
    });
  }

  // ========================================
  // ACCIONES
  // ========================================

  generateReport(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    this.topPerformersPage.set(1);
    this.worstPerformersPage.set(1);

    const formValue = this.filterForm.value;
    const request: ExecutiveReportRequest = {
      year: formValue.year,
      comparisonYear: formValue.comparisonYear || undefined,
      period: formValue.period || undefined
    };

    this.reportService.generateExecutiveReport(request).subscribe({
      next: (response) => {
        this.reportData.set(response);
        this.isLoading.set(false);
        this.notification.success('Reporte ejecutivo generado exitosamente');
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.notification.error('No tienes permisos para generar este reporte');
        } else {
          this.notification.error('Error al generar reporte');
        }
        console.error('Error generating report:', error);
      }
    });
  }

  exportCsv(): void {
    const data = this.reportData();
    if (!data) {
      this.notification.error('No hay datos para exportar');
      return;
    }

    // Combinar múltiples datasets para CSV
    const combinedData = [
      ...data.propertyROIs,
      ...data.locationProfitability,
      ...data.propertyPerformance.topPerformers
    ];

    this.reportService.exportToCsv(
      combinedData,
      `reporte-ejecutivo-${data.year}-${new Date().toISOString().split('T')[0]}`
    );
    this.notification.success('CSV exportado exitosamente');
  }

  exportPdf(): void {
    const data = this.reportData();
    if (!data) {
      this.notification.error('No hay datos para exportar');
      return;
    }

    this.isExporting.set(true);
    this.reportService.exportToPdf('EXECUTIVE', data).subscribe({
      next: (blob) => {
        this.reportService.downloadPdfBlob(
          blob,
          `reporte-ejecutivo-${data.year}-${new Date().toISOString().split('T')[0]}`
        );
        this.isExporting.set(false);
        this.notification.success('PDF exportado exitosamente');
      },
      error: (error) => {
        this.isExporting.set(false);
        this.notification.error('Error al exportar PDF');
        console.error('Error exporting PDF:', error);
      }
    });
  }

  exportExcel(): void {
    const data = this.reportData();
    if (!data) {
      this.notification.error('No hay datos para exportar');
      return;
    }

    this.isExporting.set(true);
    this.reportService.exportToExcel('EXECUTIVE', data).subscribe({
      next: (blob) => {
        this.reportService.downloadExcelBlob(
          blob,
          `reporte-ejecutivo-${data.year}-${new Date().toISOString().split('T')[0]}`
        );
        this.isExporting.set(false);
        this.notification.success('Excel exportado exitosamente');
      },
      error: (error) => {
        this.isExporting.set(false);
        this.notification.error('Error al exportar Excel');
        console.error('Error exporting Excel:', error);
      }
    });
  }

  clearFilters(): void {
    this.initForm();
    this.reportData.set(null);
    this.topPerformersPage.set(1);
    this.worstPerformersPage.set(1);
  }

  // ========================================
  // PAGINACIÓN
  // ========================================

  goToTopPerformersPage(page: number): void {
    if (page >= 1 && page <= this.topPerformersTotalPages()) {
      this.topPerformersPage.set(page);
    }
  }

  goToWorstPerformersPage(page: number): void {
    if (page >= 1 && page <= this.worstPerformersTotalPages()) {
      this.worstPerformersPage.set(page);
    }
  }

  // ========================================
  // HELPERS
  // ========================================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  getGrowthClass(growth: number): string {
    if (growth > 10) return 'growth-excellent';
    if (growth > 5) return 'growth-good';
    if (growth > 0) return 'growth-positive';
    if (growth === 0) return 'growth-neutral';
    if (growth > -5) return 'growth-negative';
    return 'growth-critical';
  }

  getGrowthIcon(growth: number): string {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  }

  getROIClass(roi: number): string {
    if (roi >= 15) return 'roi-excellent';
    if (roi >= 10) return 'roi-good';
    if (roi >= 5) return 'roi-fair';
    return 'roi-poor';
  }

  getOccupancyClass(rate: number): string {
    if (rate >= 90) return 'occupancy-excellent';
    if (rate >= 75) return 'occupancy-good';
    if (rate >= 60) return 'occupancy-fair';
    return 'occupancy-poor';
  }

  getCollectionClass(rate: number): string {
    if (rate >= 95) return 'collection-excellent';
    if (rate >= 85) return 'collection-good';
    if (rate >= 75) return 'collection-fair';
    return 'collection-poor';
  }

  getPerformanceRank(index: number): string {
    const ranks = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return ranks[index] || `${index + 1}`;
  }

  getPeriodLabel(period: string | null): string {
    if (!period) return 'Año Completo';
    const labels: Record<string, string> = {
      'Q1': 'Q1 (Enero - Marzo)',
      'Q2': 'Q2 (Abril - Junio)',
      'Q3': 'Q3 (Julio - Septiembre)',
      'Q4': 'Q4 (Octubre - Diciembre)',
      'S1': 'S1 (Enero - Junio)',
      'S2': 'S2 (Julio - Diciembre)'
    };
    return labels[period] || period;
  }

  getPageNumbers(currentPage: number, totalPages: number): number[] {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, -1, totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, -1, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
      }
    }

    return pages;
  }
}
