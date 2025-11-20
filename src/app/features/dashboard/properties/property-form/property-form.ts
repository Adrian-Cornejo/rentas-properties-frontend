import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { LocationService } from '../../../../core/services/location.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PropertyDetailResponse } from '../../../../core/models/properties/property-detail-response';
import { LocationResponse } from '../../../../core/models/location/location-response';
import { CreatePropertyRequest } from '../../../../core/models/properties/property-request';
import { UpdatePropertyRequest } from '../../../../core/models/properties/update-property-request';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  locations = signal<LocationResponse[]>([]);
  selectedProperty = signal<PropertyDetailResponse | null>(null);
  activeTab = signal<string>('basic');
  propertyImages = signal<string[]>([]);

  // Forms
  propertyForm!: FormGroup;

  // Computed
  currentUser = this.authService.currentUser;

  notesLength = computed(() => {
    const notes = this.propertyForm?.get('notes')?.value || '';
    return notes.length;
  });

  maxImagesAllowed = computed(() => {
    const plan = this.authService.organizationInfo()?.subscriptionPlan;
    switch (plan) {
      case 'BASICO':
        return 3;
      case 'INTERMEDIO':
        return 5;
      case 'SUPERIOR':
        return 10;
      default:
        return 3; // Por defecto BASICO
    }
  });

  canAddMoreImages = computed(() => {
    return this.propertyImages().length < this.maxImagesAllowed();
  });

  ngOnInit(): void {
    this.initForm();
    this.loadLocations();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadProperty(id);
    }
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

  private loadProperty(id: string): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (data) => {
        this.selectedProperty.set(data);

        // Cargar imágenes existentes si las hay
        if (data.imageUrls && data.imageUrls.length > 0) {
          this.propertyImages.set([...data.imageUrls]);
        }

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
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar propiedad');
        this.cancel();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/properties']);
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
        notes: formValue.notes,
        imageUrls: this.propertyImages()
      };

      this.propertyService.updateProperty(this.selectedProperty()!.id, request).subscribe({
        next: () => {
          this.notification.success('Propiedad actualizada exitosamente');
          this.router.navigate(['/dashboard/properties']);
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
        notes: formValue.notes,
        imageUrls: this.propertyImages()
      };

      this.propertyService.createProperty(request).subscribe({
        next: () => {
          this.notification.success('Propiedad creada exitosamente');
          this.router.navigate(['/dashboard/properties']);
          this.isSaving.set(false);
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al crear propiedad');
          this.isSaving.set(false);
        }
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  incrementValue(fieldName: string, step: number = 1): void {
    const control = this.propertyForm.get(fieldName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(currentValue + step);
    }
  }

  decrementValue(fieldName: string, step: number = 1): void {
    const control = this.propertyForm.get(fieldName);
    if (control) {
      const currentValue = control.value || 0;
      const minValue = fieldName === 'floors' ? 1 : 0;
      if (currentValue > minValue) {
        control.setValue(currentValue - step);
      }
    }
  }

  // Métodos para manejo de imágenes
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.notification.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño máximo (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.notification.error('La imagen no debe superar los 5MB');
      return;
    }

    // Validar límite de imágenes según plan
    if (!this.canAddMoreImages()) {
      this.notification.error(`Has alcanzado el límite de ${this.maxImagesAllowed()} imágenes para tu plan`);
      return;
    }

    this.uploadImage(file);

    // Limpiar input
    input.value = '';
  }

  private uploadImage(file: File): void {
    this.isUploadingImage.set(true);

    const formData = new FormData();
    formData.append('file', file);

    // Aquí usa tu servicio de Cloudinary existente
    // Ejemplo: this.cloudinaryService.uploadImage(formData)
    this.propertyService.uploadPropertyImage(formData).subscribe({
      next: (response: { url: string }) => {
        const currentImages = this.propertyImages();
        this.propertyImages.set([...currentImages, response.url]);
        this.notification.success('Imagen subida exitosamente');
        this.isUploadingImage.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al subir imagen');
        this.isUploadingImage.set(false);
      }
    });
  }

  removeImage(index: number): void {
    const currentImages = this.propertyImages();
    const updatedImages = currentImages.filter((_, i) => i !== index);
    this.propertyImages.set(updatedImages);
    this.notification.success('Imagen eliminada');
  }

  getPlanName(): string {
    const plan = this.authService.organizationInfo()?.subscriptionPlan;
    switch (plan) {
      case 'BASICO':
        return 'Básico';
      case 'INTERMEDIO':
        return 'Intermedio';
      case 'SUPERIOR':
        return 'Superior';
      default:
        return 'Básico';
    }
  }
}
