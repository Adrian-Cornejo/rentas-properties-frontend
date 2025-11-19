import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { LocationService } from '../../../core/services/location.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LocationDetailResponse } from '../../../core/models/location/location-detail-response';
import { LocationResponse } from '../../../core/models/location/location-response';
import { CreateLocationRequest } from '../../../core/models/location/location-request';
import { UpdateLocationRequest } from '../../../core/models/location/update-location-request';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkeletonModule
  ],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class LocationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Signals
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  locations = signal<LocationResponse[]>([]);
  selectedLocation = signal<LocationDetailResponse | null>(null);
  locationToDelete = signal<string | null>(null);
  searchTerm = signal<string>('');

  // Forms
  locationForm!: FormGroup;

  // Computed
  currentUser = this.authService.currentUser;

  filteredLocations = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.locations();

    return this.locations().filter(loc =>
      loc.name.toLowerCase().includes(term) ||
      loc.city?.toLowerCase().includes(term) ||
      loc.state?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.initForm();
    this.loadLocations();
  }

  private initForm(): void {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      address: ['', Validators.maxLength(500)],
      city: ['', Validators.maxLength(100)],
      state: ['', Validators.maxLength(100)],
      postalCode: ['', [Validators.maxLength(10), Validators.pattern(/^\d{5}$/)]],
      description: ['', Validators.maxLength(1000)]
    });
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

  startCreating(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedLocation.set(null);
    this.locationForm.reset({
      name: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      description: ''
    });
  }

  startEditing(location: LocationResponse): void {
    this.isLoading.set(true);

    this.locationService.getLocationById(location.id).subscribe({
      next: (data) => {
        this.selectedLocation.set(data);
        this.isCreating.set(true);
        this.isEditing.set(true);

        this.locationForm.patchValue({
          name: data.name,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          description: data.description || ''
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar ubicación');
        this.isLoading.set(false);
      }
    });
  }

  cancelEditing(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.selectedLocation.set(null);
    this.locationForm.reset();
  }

  saveLocation(): void {
    if (this.locationForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    const formValue = this.locationForm.value;

    if (this.isEditing()) {
      const request: UpdateLocationRequest = {
        name: formValue.name,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        postalCode: formValue.postalCode || undefined,
        description: formValue.description || undefined
      };

      this.locationService.updateLocation(this.selectedLocation()!.id, request).subscribe({
        next: () => {
          this.notification.success('Ubicación actualizada exitosamente');
          this.loadLocations();
          this.cancelEditing();
          this.isSaving.set(false);
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al actualizar ubicación');
          this.isSaving.set(false);
        }
      });
    } else {
      const request: CreateLocationRequest = {
        name: formValue.name,
        address: formValue.address || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        postalCode: formValue.postalCode || undefined,
        description: formValue.description || undefined
      };

      this.locationService.createLocation(request).subscribe({
        next: () => {
          this.notification.success('Ubicación creada exitosamente');
          this.loadLocations();
          this.cancelEditing();
          this.isSaving.set(false);
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al crear ubicación');
          this.isSaving.set(false);
        }
      });
    }
  }

  confirmDelete(id: string): void {
    this.locationToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.locationToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteLocation(): void {
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

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }
}
