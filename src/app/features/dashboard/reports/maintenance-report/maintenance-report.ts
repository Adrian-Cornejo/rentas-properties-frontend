// src/app/features/dashboard/reports/maintenance-report/maintenance-report.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { PlanService } from '../../../../core/services/plan.service';
import { PropertyService } from '../../../../core/services/property.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceReportRequest } from '../../../../core/models/reports/report-requests';
import { MaintenanceReportResponse } from '../../../../core/models/reports/report-responses';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './maintenance-report.html',
  styleUrl: './maintenance-report.css'
})
export class MaintenanceReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly planService = inject(PlanService);
  private readonly propertyService = inject(PropertyService);
  private readonly notification = inject(NotificationService);

  // ========================================
  // SIGNALS
  // ========================================

  isLoading = signal(false);
  isExporting = signal(false);
  reportData = signal<MaintenanceReportResponse | null>(null);
  dateRangeError = signal<string | null>(null);
  properties = signal<any[]>([]);

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

  maintenanceTypes = [
    { label: 'Todos', value: '' },
    { label: 'Preventivo', value: 'PREVENTIVO' },
    { label: 'Correctivo', value: 'CORRECTIVO' },
    { label: 'Emergencia', value: 'EMERGENCIA' }
  ];

  maintenanceStatuses = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Progreso', value: 'EN_PROGRESO' },
    { label: 'Completado', value: 'COMPLETADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  categories = [
    { label: 'Todas', value: '' },
    { label: 'Plomería', value: 'PLOMERIA' },
    { label: 'Electricidad', value: 'ELECTRICIDAD' },
    { label: 'Pintura', value: 'PINTURA' },
    { label: 'Limpieza', value: 'LIMPIEZA' },
    { label: 'Jardinería', value: 'JARDINERIA' },
    { label: 'Seguridad', value: 'SEGURIDAD' },
    { label: 'Otros', value: 'OTROS' }
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

  paginatedMaintenances = computed(() => {
    const data = this.reportData();
    if (!data) return [];

    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();

    // Mapear propertyMaintenances a formato de tabla
    return data.propertyMaintenances.map(pm => ({
      propertyCode: pm.propertyCode,
      propertyAddress: pm.address,
      maintenanceType: pm.mostFrequentType,
      category: pm.mostFrequentCategory,
      description: `${pm.maintenanceCount} mantenimientos`,
      date: '', // No disponible en este nivel
      status: 'COMPLETADO', // Asumimos completados
      estimatedCost: pm.estimatedCost,
      actualCost: pm.actualCost,
      variance: ((pm.actualCost - pm.estimatedCost) / pm.estimatedCost) * 100
    })).slice(start, end);
  });

  totalPages = computed(() => {
    const data = this.reportData();
    if (!data) return 0;
    return Math.ceil(data.propertyMaintenances.length / this.pageSize());
  });

  // ========================================
  // LIFECYCLE
  // ========================================

  ngOnInit(): void {
    this.initForm();
    this.loadProperties();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  private initForm(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Últimos 3 meses por defecto

    this.filterForm = this.fb.group({
      startDate: [this.formatDateForInput(startDate), Validators.required],
      endDate: [this.formatDateForInput(endDate), Validators.required],
      maintenanceType: [''],
      status: [''],
      category: [''],
      propertyId: ['']
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
    const request: MaintenanceReportRequest = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      maintenanceType: formValue.maintenanceType || undefined,
      status: formValue.status || undefined,
      category: formValue.category || undefined,
      propertyId: formValue.propertyId || undefined
    };

    this.reportService.generateMaintenanceReport(request).subscribe({
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
      data.propertyMaintenances,
      `reporte-mantenimientos-${new Date().toISOString().split('T')[0]}`
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
    this.reportService.exportToPdf('MAINTENANCE', data).subscribe({
      next: (blob) => {
        this.reportService.downloadPdfBlob(
          blob,
          `reporte-mantenimientos-${new Date().toISOString().split('T')[0]}`
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
    this.reportService.exportToExcel('MAINTENANCE', data).subscribe({
      next: (blob) => {
        this.reportService.downloadExcelBlob(
          blob,
          `reporte-mantenimientos-${new Date().toISOString().split('T')[0]}`
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

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  getTypeClass(type: string): string {
    switch (type) {
      case 'PREVENTIVO':
        return 'type-preventive';
      case 'CORRECTIVO':
        return 'type-corrective';
      case 'EMERGENCIA':
        return 'type-emergency';
      default:
        return 'type-default';
    }
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'PREVENTIVO': 'Preventivo',
      'CORRECTIVO': 'Correctivo',
      'EMERGENCIA': 'Emergencia'
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETADO':
        return 'status-completed';
      case 'EN_PROGRESO':
        return 'status-progress';
      case 'PENDIENTE':
        return 'status-pending';
      case 'CANCELADO':
        return 'status-canceled';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'COMPLETADO': 'Completado',
      'EN_PROGRESO': 'En Progreso',
      'PENDIENTE': 'Pendiente',
      'CANCELADO': 'Cancelado'
    };
    return labels[status] || status;
  }

  getCostVarianceClass(variance: number): string {
    if (variance > 20) return 'variance-high';
    if (variance > 10) return 'variance-medium';
    if (variance > 0) return 'variance-low';
    if (variance === 0) return 'variance-zero';
    return 'variance-negative';
  }

  getCompletionClass(rate: number): string {
    if (rate >= 90) return 'completion-excellent';
    if (rate >= 70) return 'completion-good';
    if (rate >= 50) return 'completion-fair';
    return 'completion-poor';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'PLOMERIA': 'Plomería',
      'ELECTRICIDAD': 'Electricidad',
      'PINTURA': 'Pintura',
      'LIMPIEZA': 'Limpieza',
      'JARDINERIA': 'Jardinería',
      'SEGURIDAD': 'Seguridad',
      'OTROS': 'Otros'
    };
    return labels[category] || category;
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
