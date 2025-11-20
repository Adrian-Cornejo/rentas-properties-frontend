import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyResponse } from '../../../../core/models/properties/property-response';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.html',
  styleUrl: '../properties.css',
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: PropertyResponse;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  onEdit(): void {
    this.edit.emit(this.property.id);
  }

  onDelete(): void {
    this.delete.emit(this.property.id);
  }

  getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CASA': 'Casa',
      'DEPARTAMENTO': 'Departamento',
      'LOCAL_COMERCIAL': 'Local Comercial'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DISPONIBLE': 'Disponible',
      'RENTADA': 'Rentada',
      'MANTENIMIENTO': 'Mantenimiento'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'DISPONIBLE': 'status-available',
      'RENTADA': 'status-rented',
      'MANTENIMIENTO': 'status-maintenance'
    };
    return classes[status] || '';
  }
}
