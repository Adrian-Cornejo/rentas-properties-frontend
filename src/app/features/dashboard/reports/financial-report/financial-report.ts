// src/app/features/dashboard/reports/financial-report/financial-report.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { PlanService } from '../../../../core/services/plan.service';
import { PropertyService } from '../../../../core/services/property.service';
import { LocationService } from '../../../../core/services/location.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinancialReportRequest } from '../../../../core/models/reports/report-requests';
import { FinancialReportResponse } from '../../../../core/models/reports/report-responses';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './financial-report.html',
  styleUrl: './financial-report.css'
})
export class FinancialReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly planService = inject(PlanService);
  private readonly propertyService = inject(PropertyService);
  private readonly locationService = inject(LocationService);
  private readonly notification = inject(NotificationService);

  // ========================================
  // SIGNALS
  // ========================================

  isLoading = signal(false);
  isExporting = signal(false);
  reportData = signal<FinancialReportResponse | null>(null);
  dateRangeError = signal<string | null>(null);
  properties = signal<any[]>([]);
  locations = signal<any[]>([]);

  // Paginación de tabla
  currentPage = signal(1);
  pageSize = signal(10);

  // ========================================
  // FORM
  // ========================================

  filterForm!: FormGroup;

  // ========================================
  // OPCIONES
  // ========================================

  propertyTypes = [
    { label: 'Casa', value: 'CASA' },
    { label: 'Departamento', value: 'DEPARTAMENTO' },
    { label: 'Local Comercial', value: 'LOCAL_COMERCIAL' },
    { label: 'Oficina', value: 'OFICINA' },
    { label: 'Bodega', value: 'BODEGA' }
  ];

  // ========================================
  // FECHAS LÍMITE SEGÚN PLAN
  // ========================================

  maxDate = computed(() => {
    return this.formatDateForInput(new Date());
  });

  minDate = computed(() => {
    const reportHistoryDays = this.planService.getLimit('reportHistoryDays');
    if (reportHistoryDays === -1) {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 10);
      return this.formatDateForInput(date);
    }
    const date = new Date();
    date.setDate(date.getDate() - reportHistoryDays);
    return this.formatDateForInput(date);
  });

  // ========================================
  // PERMISOS DE EXPORTACIÓN
  // ========================================

  canExportCsv = computed(() => true);
  canExportPdf = computed(() => this.planService.hasFeature('PDF_REPORTS'));
  canExportExcel = computed(() => this.planService.hasFeature('DATA_EXPORT'));

  // ========================================
  // COMPUTED - DATOS DE TABLA PAGINADOS
  // ========================================

  paginatedProperties = computed(() => {
    const data = this.reportData();
    if (!data) return [];

    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return data.propertyIncomes.slice(start, end);
  });

  totalPages = computed(() => {
    const data = this.reportData();
    if (!data) return 0;
    return Math.ceil(data.propertyIncomes.length / this.pageSize());
  });

  // ========================================
  // LIFECYCLE
  // ========================================

  ngOnInit(): void {
    this.initForm();
    this.loadProperties();
    this.loadLocations();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  private initForm(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.filterForm = this.fb.group({
      startDate: [this.formatDateForInput(startDate), Validators.required],
      endDate: [this.formatDateForInput(endDate), Validators.required],
      propertyId: [''],
      locationId: [''],
      propertyType: ['']
    });
  }

  private loadProperties(): void {
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties.set(properties);
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.notification.error('Error al cargar propiedades');
      }
    });
  }

  private loadLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.notification.error('Error al cargar ubicaciones');
      }
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
    this.dateRangeError.set(null);
    this.currentPage.set(1);

    const formValue = this.filterForm.value;
    const request: FinancialReportRequest = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      propertyId: formValue.propertyId || undefined,
      locationId: formValue.locationId || undefined,
      propertyType: formValue.propertyType || undefined
    };

    this.reportService.generateFinancialReport(request).subscribe({
      next: (response) => {
        this.reportData.set(response);
        this.isLoading.set(false);
        this.notification.success('Reporte generado exitosamente');
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 400) {
          this.dateRangeError.set(error.error.message || 'Rango de fechas inválido');
          this.notification.error('Rango de fechas inválido');
        } else if (error.status === 403) {
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

    this.reportService.exportToCsv(
      data.propertyIncomes,
      `reporte-financiero-${new Date().toISOString().split('T')[0]}`
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
    this.reportService.exportToPdf('FINANCIAL', data).subscribe({
      next: (blob) => {
        this.reportService.downloadPdfBlob(
          blob,
          `reporte-financiero-${new Date().toISOString().split('T')[0]}`
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
    this.reportService.exportToExcel('FINANCIAL', data).subscribe({
      next: (blob) => {
        this.reportService.downloadExcelBlob(
          blob,
          `reporte-financiero-${new Date().toISOString().split('T')[0]}`
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
    this.dateRangeError.set(null);
    this.currentPage.set(1);
  }

  // ========================================
  // PAGINACIÓN
  // ========================================

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  changePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1);
  }

  // ========================================
  // HELPERS
  // ========================================

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getTrendClass(trend: string): string {
    return trend === 'UP' ? 'trend-up' :
      trend === 'DOWN' ? 'trend-down' :
        'trend-stable';
  }

  getTrendIcon(trend: string): string {
    return trend === 'UP' ? '↑' :
      trend === 'DOWN' ? '↓' :
        '→';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(netProfit: number): string {
    if (netProfit > 0) return 'status-positive';
    if (netProfit < 0) return 'status-negative';
    return 'status-neutral';
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }

    return pages;
  }

  protected readonly Math = Math;
}
