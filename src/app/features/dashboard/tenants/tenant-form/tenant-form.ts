import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TenantService } from '../../../../core/services/tenant.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { TenantDetailResponse } from '../../../../core/models/tenents/tenent-detail-response';
import { CreateTenantRequest } from '../../../../core/models/tenents/tenant-request';
import { UpdateTenantRequest } from '../../../../core/models/tenents/update-tenant-request';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.css',
})
export class TenantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private cloudinaryService = inject(CloudinaryService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isUploadingINE = signal<boolean>(false);
  selectedTenant = signal<TenantDetailResponse | null>(null);
  activeTab = signal<string>('basic');
  ineImageUrl = signal<string | null>(null);
  inePublicId = signal<string | null>(null);

  // Form
  tenantForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.tenantForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      ineNumber: [''],
      numberOfOccupants: [1, [Validators.required, Validators.min(1)]],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadTenant(id);
    }
  }

  private loadTenant(id: string): void {
    this.tenantService.getTenantById(id).subscribe({
      next: (tenant) => {
        this.selectedTenant.set(tenant);
        this.patchFormValues(tenant);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar inquilino');
        this.router.navigate(['/dashboard/tenants']);
      }
    });
  }

  private patchFormValues(tenant: TenantDetailResponse): void {
    this.tenantForm.patchValue({
      fullName: tenant.fullName,
      phone: tenant.phone,
      email: tenant.email || '',
      ineNumber: tenant.ineNumber || '',
      numberOfOccupants: tenant.numberOfOccupants,
      notes: tenant.notes || ''
    });

    // Cargar imagen y public_id si existen
    if (tenant.ineImageUrl) {
      this.ineImageUrl.set(tenant.ineImageUrl);
    }
    if (tenant.inePublicId) {
      this.inePublicId.set(tenant.inePublicId);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  incrementOccupants(): void {
    const current = this.tenantForm.get('numberOfOccupants')?.value || 0;
    this.tenantForm.patchValue({ numberOfOccupants: current + 1 });
  }

  decrementOccupants(): void {
    const current = this.tenantForm.get('numberOfOccupants')?.value || 1;
    if (current > 1) {
      this.tenantForm.patchValue({ numberOfOccupants: current - 1 });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.notification.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.notification.error('La imagen no debe superar los 5MB');
      return;
    }

    this.uploadINEImage(file);
  }

  private uploadINEImage(file: File): void {
    this.isUploadingINE.set(true);

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (response) => {
        this.ineImageUrl.set(response.url);
        this.inePublicId.set(response.publicId);
        this.notification.success('Imagen de INE cargada exitosamente');
        this.isUploadingINE.set(false);
      },
      error: (error) => {
        this.notification.error('Error al subir imagen de INE');
        this.isUploadingINE.set(false);
        console.error('Error uploading to Cloudinary:', error);
      }
    });
  }

  removeINEImage(): void {
    const tenantId = this.selectedTenant()?.id;

    if (tenantId && this.isEditing()) {
      // Si estamos editando, eliminar del backend
      this.tenantService.deleteTenantIneImage(tenantId).subscribe({
        next: () => {
          this.ineImageUrl.set(null);
          this.inePublicId.set(null);
          this.tenantForm.patchValue({ ineNumber: '' });
          this.notification.info('Imagen de INE eliminada');
        },
        error: (error) => {
          this.notification.error('Error al eliminar imagen de INE');
          console.error('Error deleting INE image:', error);
        }
      });
    } else {
      // Si estamos creando, solo limpiar localmente
      this.ineImageUrl.set(null);
      this.inePublicId.set(null);
      this.tenantForm.patchValue({ ineNumber: '' });
      this.notification.info('Imagen de INE eliminada');
    }
  }

  saveTenant(): void {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing()) {
      this.updateTenant();
    } else {
      this.createTenant();
    }
  }

  private createTenant(): void {
    const request: CreateTenantRequest = {
      fullName: this.tenantForm.get('fullName')?.value,
      phone: this.tenantForm.get('phone')?.value,
      email: this.tenantForm.get('email')?.value || undefined,
      ineNumber: this.tenantForm.get('ineNumber')?.value || undefined,
      ineImageUrl: this.ineImageUrl() || undefined,
      inePublicId: this.inePublicId() || undefined,
      numberOfOccupants: this.tenantForm.get('numberOfOccupants')?.value,
      notes: this.tenantForm.get('notes')?.value || undefined,
    };

    this.tenantService.createTenant(request).subscribe({
      next: () => {
        this.notification.success('Inquilino creado exitosamente');
        this.router.navigate(['/dashboard/tenants']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al crear inquilino');
        this.isSaving.set(false);
      }
    });
  }

  private updateTenant(): void {
    const tenant = this.selectedTenant();
    if (!tenant) return;

    // El backend se encarga de eliminar la imagen anterior si cambió
    const request: UpdateTenantRequest = {
      fullName: this.tenantForm.get('fullName')?.value,
      phone: this.tenantForm.get('phone')?.value,
      email: this.tenantForm.get('email')?.value || undefined,
      ineNumber: this.tenantForm.get('ineNumber')?.value || undefined,
      ineImageUrl: this.ineImageUrl() || undefined,
      inePublicId: this.inePublicId() || undefined,
      numberOfOccupants: this.tenantForm.get('numberOfOccupants')?.value,
      notes: this.tenantForm.get('notes')?.value || undefined,
    };

    this.tenantService.updateTenant(tenant.id, request).subscribe({
      next: () => {
        this.notification.success('Inquilino actualizado exitosamente');
        this.router.navigate(['/dashboard/tenants']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al actualizar inquilino');
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/tenants']);
  }

  getCharCount(): number {
    return this.tenantForm.get('notes')?.value?.length || 0;
  }
}
