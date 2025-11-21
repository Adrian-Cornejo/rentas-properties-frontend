import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../../../core/services/location.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateLocationRequest } from '../../../../core/models/location/location-request';
import { UpdateLocationRequest } from '../../../../core/models/location/update-location-request';
import { LocationDetailResponse } from '../../../../core/models/location/location-detail-response';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './location-form.html',
  styleUrl: './location-form.css'
})
export class LocationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(LocationService);
  private notification = inject(NotificationService);

  locationForm!: FormGroup;
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  locationId = signal<string | null>(null);
  locationData = signal<LocationDetailResponse | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
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

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.locationId.set(id);
      this.isEditMode.set(true);
      this.loadLocation(id);
    }
  }

  private loadLocation(id: string): void {
    this.isLoading.set(true);

    this.locationService.getLocationById(id).subscribe({
      next: (data) => {
        this.locationData.set(data);
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
        this.router.navigate(['/dashboard/locations']);
      }
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);
    const formValue = this.locationForm.value;

    if (this.isEditMode()) {
      this.updateLocation(formValue);
    } else {
      this.createLocation(formValue);
    }
  }

  private createLocation(formValue: any): void {
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
        this.router.navigate(['/dashboard/locations']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al crear ubicación');
        this.isSaving.set(false);
      }
    });
  }

  private updateLocation(formValue: any): void {
    const request: UpdateLocationRequest = {
      name: formValue.name,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      state: formValue.state || undefined,
      postalCode: formValue.postalCode || undefined,
      description: formValue.description || undefined
    };

    this.locationService.updateLocation(this.locationId()!, request).subscribe({
      next: () => {
        this.notification.success('Ubicación actualizada exitosamente');
        this.router.navigate(['/dashboard/locations']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al actualizar ubicación');
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/locations']);
  }
}
