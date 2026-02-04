// src/app/features/dashboard/locations/location-list/location-list.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { LocationService } from '../../../../core/services/location.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LocationResponse } from '../../../../core/models/location/location-response';
import { LocationCardComponent } from '../location-card/location-card';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    LocationCardComponent
  ],
  templateUrl: './location-list.html',
  styleUrl: './location-list.css'
})
export class LocationListComponent implements OnInit {
  private router = inject(Router);
  private locationService = inject(LocationService);
  private notification = inject(NotificationService);

  // Signals
  locations = signal<LocationResponse[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  showDeleteConfirm = signal<boolean>(false);
  locationToDelete = signal<string | null>(null);

  // Computed - ACTUALIZADO
  filteredLocations = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.locations();

    return this.locations().filter(loc =>
      loc.name.toLowerCase().includes(term) ||
      loc.state?.toLowerCase().includes(term) ||
      loc.municipality?.toLowerCase().includes(term) ||
      loc.neighborhood?.toLowerCase().includes(term) ||
      loc.postalCode?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadLocations();
  }

  private loadLocations(): void {
    this.isLoading.set(true);

    this.locationService.getAllLocations(false).subscribe({
      next: (data) => {
        this.locations.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar ubicaciones');
        this.isLoading.set(false);
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/dashboard/locations/new']);
  }

  onEdit(locationId: string): void {
    this.router.navigate(['/dashboard/locations/edit', locationId]);
  }

  onDelete(locationId: string): void {
    this.locationToDelete.set(locationId);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.locationToDelete();
    if (!id) return;

    this.locationService.deleteLocation(id).subscribe({
      next: () => {
        this.notification.success('Ubicación eliminada exitosamente');
        this.loadLocations();
        this.cancelDelete();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al eliminar ubicación');
        this.cancelDelete();
      }
    });
  }

  cancelDelete(): void {
    this.locationToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
}
