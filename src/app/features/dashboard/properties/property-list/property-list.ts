import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { PropertyService } from '../../../../core/services/property.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PropertyResponse } from '../../../../core/models/properties/property-response';
import {PropertyCardComponent} from '../property-card/property-card';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    PropertyCardComponent
  ],
  templateUrl: './property-list.html',
  styleUrl: '../properties.css',
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Signals
  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  properties = signal<PropertyResponse[]>([]);
  propertyToDelete = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  searchTerm = signal<string>('');

  // Computed
  filteredProperties = computed(() => {
    let props = this.properties();

    if (this.filterStatus() !== 'ALL') {
      props = props.filter(p => p.status === this.filterStatus());
    }

    const term = this.searchTerm().toLowerCase();
    if (term) {
      props = props.filter(p =>
        p.propertyCode.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        p.locationName?.toLowerCase().includes(term)
      );
    }

    return props;
  });

  availableCount = computed(() =>
    this.properties().filter(p => p.status === 'DISPONIBLE').length
  );

  rentedCount = computed(() =>
    this.properties().filter(p => p.status === 'RENTADA').length
  );

  maintenanceCount = computed(() =>
    this.properties().filter(p => p.status === 'MANTENIMIENTO').length
  );

  ngOnInit(): void {
    this.loadProperties();
  }

  private loadProperties(): void {
    this.isLoading.set(true);

    this.propertyService.getAllProperties(false).subscribe({
      next: (data) => {
        this.properties.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar propiedades');
        this.isLoading.set(false);
      }
    });
  }

  startCreating(): void {
    this.router.navigate(['/dashboard/properties/new']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/dashboard/properties/edit', id]);
  }

  onDelete(id: string): void {
    this.confirmDelete(id);
  }

  confirmDelete(id: string): void {
    this.propertyToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.propertyToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteProperty(): void {
    const id = this.propertyToDelete();
    if (!id) return;

    this.propertyService.deleteProperty(id).subscribe({
      next: () => {
        this.notification.success('Propiedad eliminada exitosamente');
        this.loadProperties();
        this.cancelDelete();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al eliminar propiedad');
        this.cancelDelete();
      }
    });
  }

  setFilterStatus(status: string): void {
    this.filterStatus.set(status);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
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

  getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CASA': 'Casa',
      'DEPARTAMENTO': 'Departamento',
      'LOCAL_COMERCIAL': 'Local Comercial'
    };
    return labels[type] || type;
  }
}
