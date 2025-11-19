import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { PropertyService } from '../../../core/services/property.service';
import { LocationService } from '../../../core/services/location.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PropertyDetailResponse } from '../../../core/models/properties/property-detail-response';
import { PropertyResponse } from '../../../core/models/properties/property-response';
import { LocationResponse } from '../../../core/models/location/location-response';
import { CreatePropertyRequest } from '../../../core/models/properties/property-request';
import { UpdatePropertyRequest } from '../../../core/models/properties/update-property-request';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkeletonModule
  ],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class PropertiesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Signals
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  properties = signal<PropertyResponse[]>([]);
  locations = signal<LocationResponse[]>([]);
  selectedProperty = signal<PropertyDetailResponse | null>(null);
  propertyToDelete = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  searchTerm = signal<string>('');

  // Forms
  propertyForm!: FormGroup;

  // Computed
  currentUser = this.authService.currentUser;

  filteredProperties = computed(() => {
    let props = this.properties();

    // Filtrar por estado
    if (this.filterStatus() !== 'ALL') {
      props = props.filter(p => p.status === this.filterStatus());
    }

    // Filtrar por búsqueda
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
    this.initForm();
    this.loadProperties();
    this.loadLocations();
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      locationId: [''],
      propertyCode: ['', [Validators.required, Validators.maxLength(50)]],
      propertyType: ['CASA', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      monthlyRent: [0, [Validators.required, Validators.min(0)]],
      waterFee: [105.00, [Validators.min(0)]],
      status: ['DISPONIBLE', Validators.required],
      floors: [1, [Validators.min(1)]],
      bedrooms: [0, [Validators.min(0)]],
      bathrooms: [0, [Validators.min(0)]],
      halfBathrooms: [0, [Validators.min(0)]],
      hasLivingRoom: [false],
      hasDiningRoom: [false],
      hasKitchen: [false],
      hasServiceArea: [false],
      parkingSpaces: [0, [Validators.min(0)]],
      totalAreaM2: [0, [Validators.min(0)]],
      includesWater: [false],
      includesElectricity: [false],
      includesGas: [false],
      includesInternet: [false],
      notes: ['', Validators.maxLength(1000)]
    });
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

  private loadLocations(): void {
    this.locationService.getAllLocations(false).subscribe({
      next: (data) => {
        this.locations.set(data);
      },
      error: (error) => {
        console.error('Error al cargar ubicaciones:', error);
      }
    });
  }

  startCreating(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.selectedProperty.set(null);
    this.propertyForm.reset({
      locationId: '',
      propertyCode: '',
      propertyType: 'CASA',
      address: '',
      monthlyRent: 0,
      waterFee: 105.00,
      status: 'DISPONIBLE',
      floors: 1,
      bedrooms: 0,
      bathrooms: 0,
      halfBathrooms: 0,
      hasLivingRoom: false,
      hasDiningRoom: false,
      hasKitchen: false,
      hasServiceArea: false,
      parkingSpaces: 0,
      totalAreaM2: 0,
      includesWater: false,
      includesElectricity: false,
      includesGas: false,
      includesInternet: false,
      notes: ''
    });
  }

  startEditing(property: PropertyResponse): void {
    this.isLoading.set(true);

    this.propertyService.getPropertyById(property.id).subscribe({
      next: (data) => {
        this.selectedProperty.set(data);
        this.isCreating.set(true);
        this.isEditing.set(true);

        this.propertyForm.patchValue({
          locationId: data.locationId || '',
          propertyCode: data.propertyCode,
          propertyType: data.propertyType,
          address: data.address,
          monthlyRent: data.monthlyRent,
          waterFee: data.waterFee,
          status: data.status,
          floors: data.floors || 1,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          halfBathrooms: data.halfBathrooms || 0,
          hasLivingRoom: data.hasLivingRoom,
          hasDiningRoom: data.hasDiningRoom,
          hasKitchen: data.hasKitchen,
          hasServiceArea: data.hasServiceArea,
          parkingSpaces: data.parkingSpaces || 0,
          totalAreaM2: data.totalAreaM2 || 0,
          includesWater: data.includesWater,
          includesElectricity: data.includesElectricity,
          includesGas: data.includesGas,
          includesInternet: data.includesInternet,
          notes: data.notes || ''
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar propiedad');
        this.isLoading.set(false);
      }
    });
  }

  cancelEditing(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.selectedProperty.set(null);
    this.propertyForm.reset();
  }

  saveProperty(): void {
    if (this.propertyForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    const formValue = this.propertyForm.value;

    if (this.isEditing()) {
      const request: UpdatePropertyRequest = {
        locationId: formValue.locationId || undefined,
        propertyType: formValue.propertyType,
        address: formValue.address,
        monthlyRent: formValue.monthlyRent,
        waterFee: formValue.waterFee,
        status: formValue.status,
        floors: formValue.floors,
        bedrooms: formValue.bedrooms,
        bathrooms: formValue.bathrooms,
        halfBathrooms: formValue.halfBathrooms,
        hasLivingRoom: formValue.hasLivingRoom,
        hasDiningRoom: formValue.hasDiningRoom,
        hasKitchen: formValue.hasKitchen,
        hasServiceArea: formValue.hasServiceArea,
        parkingSpaces: formValue.parkingSpaces,
        totalAreaM2: formValue.totalAreaM2,
        includesWater: formValue.includesWater,
        includesElectricity: formValue.includesElectricity,
        includesGas: formValue.includesGas,
        includesInternet: formValue.includesInternet,
        notes: formValue.notes
      };

      this.propertyService.updateProperty(this.selectedProperty()!.id, request).subscribe({
        next: () => {
          this.notification.success('Propiedad actualizada exitosamente');
          this.loadProperties();
          this.cancelEditing();
          this.isSaving.set(false);
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al actualizar propiedad');
          this.isSaving.set(false);
        }
      });
    } else {
      const request: CreatePropertyRequest = {
        locationId: formValue.locationId || undefined,
        propertyCode: formValue.propertyCode,
        propertyType: formValue.propertyType,
        address: formValue.address,
        monthlyRent: formValue.monthlyRent,
        waterFee: formValue.waterFee,
        floors: formValue.floors,
        bedrooms: formValue.bedrooms,
        bathrooms: formValue.bathrooms,
        halfBathrooms: formValue.halfBathrooms,
        hasLivingRoom: formValue.hasLivingRoom,
        hasDiningRoom: formValue.hasDiningRoom,
        hasKitchen: formValue.hasKitchen,
        hasServiceArea: formValue.hasServiceArea,
        parkingSpaces: formValue.parkingSpaces,
        totalAreaM2: formValue.totalAreaM2,
        includesWater: formValue.includesWater,
        includesElectricity: formValue.includesElectricity,
        includesGas: formValue.includesGas,
        includesInternet: formValue.includesInternet,
        notes: formValue.notes
      };

      this.propertyService.createProperty(request).subscribe({
        next: () => {
          this.notification.success('Propiedad creada exitosamente');
          this.loadProperties();
          this.cancelEditing();
          this.isSaving.set(false);
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al crear propiedad');
          this.isSaving.set(false);
        }
      });
    }
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
