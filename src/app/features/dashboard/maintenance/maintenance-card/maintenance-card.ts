import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceRecordResponse } from '../../../../core/models/maintenanceRecord/maintenance-record-response';

@Component({
  selector: 'app-maintenance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-card.html',
  styleUrl: '../maintenance.css',
})
export class MaintenanceCardComponent {
  @Input({ required: true }) record!: MaintenanceRecordResponse;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() markCompleted = new EventEmitter<string>();

  getStatusClass(): string {
    const statusMap: Record<string, string> = {
      'COMPLETADO': 'success',
      'PENDIENTE': 'warning',
      'EN_PROCESO': 'info',
      'CANCELADO': 'error'
    };
    return statusMap[this.record.status] || 'default';
  }

  getStatusLabel(): string {
    const labelMap: Record<string, string> = {
      'COMPLETADO': 'Completado',
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En Proceso',
      'CANCELADO': 'Cancelado'
    };
    return labelMap[this.record.status] || this.record.status;
  }

  getTypeClass(): string {
    const typeMap: Record<string, string> = {
      'PREVENTIVO': 'type-preventivo',
      'CORRECTIVO': 'type-correctivo',
      'EMERGENCIA': 'type-emergencia'
    };
    return typeMap[this.record.maintenanceType] || 'type-default';
  }

  getTypeLabel(): string {
    const typeMap: Record<string, string> = {
      'PREVENTIVO': 'Preventivo',
      'CORRECTIVO': 'Correctivo',
      'EMERGENCIA': 'Emergencia'
    };
    return typeMap[this.record.maintenanceType] || this.record.maintenanceType;
  }

  getCategoryLabel(): string {
    if (!this.record.category) return 'Sin categoría';

    const categoryMap: Record<string, string> = {
      'PLOMERIA': 'Plomería',
      'ELECTRICIDAD': 'Electricidad',
      'PINTURA': 'Pintura',
      'LIMPIEZA': 'Limpieza',
      'CARPINTERIA': 'Carpintería',
      'JARDINERIA': 'Jardinería',
      'AIRE_ACONDICIONADO': 'Aire Acondicionado',
      'OTRO': 'Otro'
    };
    return categoryMap[this.record.category] || this.record.category;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  onEdit(): void {
    this.edit.emit(this.record.id);
  }

  onDelete(): void {
    this.delete.emit(this.record.id);
  }

  onMarkCompleted(): void {
    this.markCompleted.emit(this.record.id);
  }
}
