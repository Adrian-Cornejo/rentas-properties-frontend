import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MaintenanceRecordService } from '../../../../core/services/maintenance-record.service';
import { PropertyService } from '../../../../core/services/property.service';
import { ContractService } from '../../../../core/services/contract.service';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceRecordDetailResponse } from '../../../../core/models/maintenanceRecord/maintence-image';
import { PropertyResponse } from '../../../../core/models/properties/property-response';
import { ContractResponse } from '../../../../core/models/contract/contract-response';
import { CreateMaintenanceRecordRequest } from '../../../../core/models/maintenanceRecord/maintenance-record-request';
import { UpdateMaintenanceRecordRequest } from '../../../../core/models/maintenanceRecord/update-maintenance-record-request';

@Component({
  selector: 'app-maintenance-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './maintenance-form.html',
  styleUrl: './maintenance-form.css',
})
export class MaintenanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceRecordService);
  private propertyService = inject(PropertyService);
  private contractService = inject(ContractService);
  private cloudinaryService = inject(CloudinaryService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isLoadingProperties = signal<boolean>(false);
  isLoadingContracts = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  selectedRecord = signal<MaintenanceRecordDetailResponse | null>(null);
  activeTab = signal<string>('basic');

  availableProperties = signal<PropertyResponse[]>([]);
  availableContracts = signal<ContractResponse[]>([]);
  uploadedImages = signal<{ url: string; publicId: string; type: string; description?: string }[]>([]);

  // Form
  maintenanceForm!: FormGroup;

  // Options
  maintenanceTypes = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'EMERGENCIA', label: 'Emergencia' }
  ];

  categories = [
    { value: 'PLOMERIA', label: 'Plomería' },
    { value: 'ELECTRICIDAD', label: 'Electricidad' },
    { value: 'PINTURA', label: 'Pintura' },
    { value: 'LIMPIEZA', label: 'Limpieza' },
    { value: 'CARPINTERIA', label: 'Carpintería' },
    { value: 'JARDINERIA', label: 'Jardinería' },
    { value: 'AIRE_ACONDICIONADO', label: 'Aire Acondicionado' },
    { value: 'OTRO', label: 'Otro' }
  ];

  statusOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'COMPLETADO', label: 'Completado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  imageTypes = [
    { value: 'ANTES', label: 'Antes' },
    { value: 'DESPUES', label: 'Después' },
    { value: 'EVIDENCIA', label: 'Evidencia' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadProperties();

    const recordId = this.route.snapshot.paramMap.get('id');
    if (recordId) {
      this.isEditing.set(true);
      this.loadRecord(recordId);
    }
  }

  initForm(): void {
    this.maintenanceForm = this.fb.group({
      propertyId: ['', Validators.required],
      contractId: [''],
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.required],
      maintenanceType: ['', Validators.required],
      category: [''],
      maintenanceDate: ['', Validators.required],
      estimatedCost: ['', [Validators.min(0)]],
      actualCost: ['', [Validators.min(0)]],
      status: ['PENDIENTE', Validators.required],
      assignedTo: ['', [Validators.maxLength(255)]],
      notes: ['']
    });

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    this.maintenanceForm.patchValue({ maintenanceDate: today });

    // Listen to property changes to load contracts
    this.maintenanceForm.get('propertyId')?.valueChanges.subscribe(propertyId => {
      if (propertyId) {
        // this.loadContractsForProperty(propertyId);
      } else {
        this.availableContracts.set([]);
        this.maintenanceForm.patchValue({ contractId: '' });
      }
    });
  }

  loadProperties(): void {
    this.isLoadingProperties.set(true);
    this.propertyService.getAllProperties(false).subscribe({
      next: (properties) => {
        this.availableProperties.set(properties);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar propiedades');
        this.isLoadingProperties.set(false);
      }
    });
  }

  // loadContractsForProperty(propertyId: string): void {
  //   this.isLoadingContracts.set(true);
  //   this.contractService.getContractsByProperty(propertyId).subscribe({
  //     next: (contracts) => {
  //       // Only show active contracts
  //       const activeContracts = contracts.filter(c => c.status === 'ACTIVO');
  //       this.availableContracts.set(activeContracts);
  //       this.isLoadingContracts.set(false);
  //     },
  //     error: (error) => {
  //       this.notification.error('Error al cargar contratos');
  //       this.isLoadingContracts.set(false);
  //     }
  //   });
  // }

  loadRecord(id: string): void {
    this.maintenanceService.getMaintenanceRecordById(id).subscribe({
      next: (record) => {
        this.selectedRecord.set(record);
        this.populateForm(record);

        // Load contracts for the property
        if (record.property.id) {
          // this.loadContractsForProperty(record.property.id);
        }

        // Set uploaded images
        const images = record.images.map(img => ({
          url: img.imageUrl,
          publicId: img.imagePublicId,
          type: img.imageType,
          description: img.description
        }));
        this.uploadedImages.set(images);
      },
      error: (error) => {
        this.notification.error('Error al cargar registro de mantenimiento');
        this.router.navigate(['/dashboard/maintenance']);
      }
    });
  }

  populateForm(record: MaintenanceRecordDetailResponse): void {
    this.maintenanceForm.patchValue({
      propertyId: record.property.id,
      contractId: record.contract?.id || '',
      title: record.title,
      description: record.description,
      maintenanceType: record.maintenanceType,
      category: record.category || '',
      maintenanceDate: record.maintenanceDate,
      estimatedCost: record.estimatedCost || '',
      actualCost: record.actualCost || '',
      status: record.status,
      assignedTo: record.assignedTo || '',
      notes: record.notes || ''
    });
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing()) {
      this.updateRecord();
    } else {
      this.createRecord();
    }
  }

  createRecord(): void {
    const formValue = this.maintenanceForm.value;

    const request: CreateMaintenanceRecordRequest = {
      propertyId: formValue.propertyId,
      contractId: formValue.contractId || undefined,
      title: formValue.title,
      description: formValue.description,
      maintenanceType: formValue.maintenanceType,
      category: formValue.category || undefined,
      maintenanceDate: formValue.maintenanceDate,
      estimatedCost: formValue.estimatedCost || undefined,
      assignedTo: formValue.assignedTo || undefined,
      notes: formValue.notes || undefined
    };

    this.maintenanceService.createMaintenanceRecord(request).subscribe({
      next: (response) => {
        // Upload images if any
        if (this.uploadedImages().length > 0) {
          //this.uploadImagesToRecord(response.id);
        } else {
          this.notification.success('Registro de mantenimiento creado exitosamente');
          this.router.navigate(['/dashboard/maintenance']);
        }
      },
      error: (error) => {
        this.notification.error('Error al crear registro de mantenimiento');
        this.isSaving.set(false);
      }
    });
  }

  updateRecord(): void {
    const recordId = this.selectedRecord()?.id;
    if (!recordId) return;

    const formValue = this.maintenanceForm.value;

    const request: UpdateMaintenanceRecordRequest = {
      title: formValue.title,
      description: formValue.description,
      maintenanceType: formValue.maintenanceType,
      category: formValue.category || undefined,
      maintenanceDate: formValue.maintenanceDate,
      estimatedCost: formValue.estimatedCost || undefined,
      actualCost: formValue.actualCost || undefined,
      status: formValue.status,
      assignedTo: formValue.assignedTo || undefined,
      notes: formValue.notes || undefined
    };

    this.maintenanceService.updateMaintenanceRecord(recordId, request).subscribe({
      next: () => {
        this.notification.success('Registro de mantenimiento actualizado exitosamente');
        this.router.navigate(['/dashboard/maintenance']);
      },
      error: (error) => {
        this.notification.error('Error al actualizar registro de mantenimiento');
        this.isSaving.set(false);
      }
    });
  }

  // uploadImagesToRecord(recordId: string): void {
  //   const images = this.uploadedImages();
  //   let uploadedCount = 0;
  //
  //   images.forEach(image => {
  //     this.maintenanceService.addImage(
  //       recordId,
  //       image.url,
  //       image.,
  //       image.url,
  //     ).subscribe({
  //       next: () => {
  //         uploadedCount++;
  //         if (uploadedCount === images.length) {
  //           this.notification.success('Registro de mantenimiento creado exitosamente');
  //           this.router.navigate(['/dashboard/maintenance']);
  //         }
  //       },
  //       error: (error) => {
  //         this.notification.error('Error al subir imagen');
  //       }
  //     });
  //   });
  // }

  onImageUpload(event: Event, imageType: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.notification.error('El archivo debe ser una imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.notification.error('La imagen no debe superar 5MB');
      return;
    }

    this.isUploadingImage.set(true);

    this.cloudinaryService.uploadImage(file).subscribe({
      next: (response) => {
        const newImage = {
          url: response.url,
          publicId: response.publicId,
          type: imageType,
          description: undefined
        };

        this.uploadedImages.update(images => [...images, newImage]);
        this.isUploadingImage.set(false);
        this.notification.success('Imagen cargada exitosamente');
      },
      error: (error) => {
        this.notification.error('Error al cargar imagen');
        this.isUploadingImage.set(false);
      }
    });

    // Reset input
    input.value = '';
  }

  removeImage(index: number): void {
    const image = this.uploadedImages()[index];

    // Delete from Cloudinary
    this.cloudinaryService.deleteImage(image.publicId).subscribe({
      next: () => {
        this.uploadedImages.update(images => images.filter((_, i) => i !== index));
        this.notification.success('Imagen eliminada');
      },
      error: (error) => {
        this.notification.error('Error al eliminar imagen');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/maintenance']);
  }

  getPropertyLabel(propertyId: string): string {
    const property = this.availableProperties().find(p => p.id === propertyId);
    return property ? `${property.propertyCode} - ${property.address}` : '';
  }

  getContractLabel(contractId: string): string {
    const contract = this.availableContracts().find(c => c.id === contractId);
    return contract ? contract.contractNumber : '';
  }
}
