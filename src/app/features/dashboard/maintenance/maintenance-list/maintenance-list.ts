import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { MaintenanceRecordService } from '../../../../core/services/maintenance-record.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceRecordResponse } from '../../../../core/models/maintenanceRecord/maintenance-record-response';
import { MaintenanceCardComponent } from '../maintenance-card/maintenance-card';

interface PropertyMaintenanceGroup {
  propertyCode: string;
  propertyAddress: string;
  records: MaintenanceRecordResponse[];
  totalRecords: number;
  pendingCount: number;
  inProcessCount: number;
  completedCount: number;
  totalEstimatedCost: number;
  totalActualCost: number;
}

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    MaintenanceCardComponent
  ],
  templateUrl: './maintenance-list.html',
  styleUrl: '../maintenance.css',
})
export class MaintenanceListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceRecordService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  records = signal<MaintenanceRecordResponse[]>([]);
  recordToDelete = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  filterType = signal<string>('ALL');
  searchTerm = signal<string>('');
  expandedProperties = signal<Set<string>>(new Set());

  groupedRecords = computed(() => {
    let recs = this.records();

    // Apply status filter
    if (this.filterStatus() !== 'ALL') {
      recs = recs.filter(r => r.status === this.filterStatus());
    }

    // Apply type filter
    if (this.filterType() !== 'ALL') {
      recs = recs.filter(r => r.maintenanceType === this.filterType());
    }

    // Apply search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      recs = recs.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.propertyCode.toLowerCase().includes(term) ||
        r.propertyAddress.toLowerCase().includes(term) ||
        (r.category && r.category.toLowerCase().includes(term))
      );
    }

    // Group by property
    const groups = new Map<string, PropertyMaintenanceGroup>();

    recs.forEach(record => {
      const key = record.propertyCode;

      if (!groups.has(key)) {
        groups.set(key, {
          propertyCode: record.propertyCode,
          propertyAddress: record.propertyAddress,
          records: [],
          totalRecords: 0,
          pendingCount: 0,
          inProcessCount: 0,
          completedCount: 0,
          totalEstimatedCost: 0,
          totalActualCost: 0
        });
      }

      const group = groups.get(key)!;
      group.records.push(record);
      group.totalRecords++;
      group.totalEstimatedCost += record.estimatedCost || 0;
      group.totalActualCost += record.actualCost || 0;

      if (record.status === 'PENDIENTE') {
        group.pendingCount++;
      } else if (record.status === 'EN_PROCESO') {
        group.inProcessCount++;
      } else if (record.status === 'COMPLETADO') {
        group.completedCount++;
      }
    });

    // Sort records within each group by date (most recent first)
    groups.forEach(group => {
      group.records.sort((a, b) => {
        const dateA = new Date(a.maintenanceDate);
        const dateB = new Date(b.maintenanceDate);
        return dateB.getTime() - dateA.getTime();
      });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.propertyCode.localeCompare(b.propertyCode)
    );
  });

  totalRecords = computed(() => this.records().length);
  pendingCount = computed(() => this.records().filter(r => r.status === 'PENDIENTE').length);
  inProcessCount = computed(() => this.records().filter(r => r.status === 'EN_PROCESO').length);
  completedCount = computed(() => this.records().filter(r => r.status === 'COMPLETADO').length);

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.isLoading.set(true);
    this.maintenanceService.getAllMaintenanceRecords().subscribe({
      next: (records) => {
        this.records.set(records);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar registros de mantenimiento');
        this.isLoading.set(false);
      }
    });
  }

  setStatusFilter(status: string): void {
    this.filterStatus.set(status);
  }

  setTypeFilter(type: string): void {
    this.filterType.set(type);
  }

  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  toggleProperty(propertyCode: string): void {
    const expanded = new Set(this.expandedProperties());
    if (expanded.has(propertyCode)) {
      expanded.delete(propertyCode);
    } else {
      expanded.add(propertyCode);
    }
    this.expandedProperties.set(expanded);
  }

  isPropertyExpanded(propertyCode: string): boolean {
    return this.expandedProperties().has(propertyCode);
  }

  expandAll(): void {
    const allProperties = new Set(this.groupedRecords().map(g => g.propertyCode));
    this.expandedProperties.set(allProperties);
  }

  collapseAll(): void {
    this.expandedProperties.set(new Set());
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  startCreating(): void {
    this.router.navigate(['/dashboard/maintenance/new']);
  }

  onEdit(recordId: string): void {
    this.router.navigate(['/dashboard/maintenance/edit', recordId]);
  }

  onDelete(recordId: string): void {
    this.recordToDelete.set(recordId);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.recordToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const recordId = this.recordToDelete();
    if (!recordId) return;

    this.maintenanceService.deleteMaintenanceRecord(recordId).subscribe({
      next: () => {
        this.notification.success('Registro eliminado exitosamente');
        this.loadRecords();
        this.cancelDelete();
      },
      error: (error) => {
        this.notification.error('Error al eliminar registro');
        this.cancelDelete();
      }
    });
  }

  onMarkCompleted(recordId: string): void {
    this.router.navigate(['/dashboard/maintenance/complete', recordId]);
  }
}
