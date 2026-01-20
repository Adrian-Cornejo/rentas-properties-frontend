import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContractService } from '../../../../core/services/contract.service';
import { PropertyService } from '../../../../core/services/property.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PlanService } from '../../../../core/services/plan.service';
import { ContractDetailResponse } from '../../../../core/models/contract/contract-detail-response';
import { PropertyResponse } from '../../../../core/models/properties/property-response';
import { TenantResponse } from '../../../../core/models/tenents/tenant-response';
import { CreateContractRequest, TenantAssignment } from '../../../../core/models/contract/contract-request';
import { UpdateContractRequest } from '../../../../core/models/contract/update-contract';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePicker
  ],
  templateUrl: './contract-form.html',
  styleUrl: './contract-form.css',
})
export class ContractFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private propertyService = inject(PropertyService);
  private tenantService = inject(TenantService);
  private cloudinaryService = inject(CloudinaryService);
  private notification = inject(NotificationService);
  private planService = inject(PlanService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isUploadingDocument = signal<boolean>(false);
  isLoadingProperties = signal<boolean>(false);
  isLoadingTenants = signal<boolean>(false);
  selectedContract = signal<ContractDetailResponse | null>(null);
  activeTab = signal<string>('basic');

  availableProperties = signal<PropertyResponse[]>([]);
  availableTenants = signal<TenantResponse[]>([]);
  contractDocumentUrl = signal<string | null>(null);
  contractDocumentPublicId = signal<string | null>(null);

  assignedTenants = signal<TenantAssignment[]>([]);

  // Form
  contractForm!: FormGroup;

  // Plan features - COMPUTED SIGNALS
  planAllowsImages = computed(() => {
    const plan = this.planService.currentPlan();
    return plan?.allowsImages === true;
  });

  showDocumentsTab = computed(() => {
    return this.planAllowsImages();
  });

  // Computed
  selectedProperty = computed(() => {
    const propertyId = this.contractForm?.get('propertyId')?.value;
    if (!propertyId) return null;
    return this.availableProperties().find(p => p.id === propertyId) || null;
  });

  hasAssignedTenants = computed(() => this.assignedTenants().length > 0);

  primaryTenant = computed(() =>
    this.assignedTenants().find(t => t.isPrimary)
  );

  hasPrimaryTenant = computed(() =>
    this.assignedTenants().some(t => t.isPrimary)
  );

  canSubmit = computed(() => {
    const formValid = this.contractForm?.valid;
    const hasOneTenant = this.assignedTenants().length > 0;
    const hasOnePrimary = this.assignedTenants().filter(t => t.isPrimary).length === 1;
    return formValid && hasOneTenant && hasOnePrimary && !this.isSaving();
  });

  propertyOptions = computed(() =>
    this.availableProperties().map(property => ({
      label: `${property.propertyCode} - ${property.address}`,
      value: property.id
    }))
  );

  tenantOptions = computed(() =>
    this.availableTenants().map(tenant => ({
      label: `${tenant.fullName} - ${tenant.phone}`,
      value: tenant.id
    }))
  );

  addTenantFromSelect(tenantId: string | null): void {
    if (tenantId) {
      this.addTenant({ target: { value: tenantId } } as any);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPlanFeatures();
    this.checkEditMode();
  }

  private loadPlanFeatures(): void {
    this.planService.loadPlanFeatures().subscribe({
      next: () => {
        console.log('[ContractForm] Plan loaded');
        console.log('[ContractForm] Allows images:', this.planAllowsImages());
      },
      error: (err) => {
        console.error('[ContractForm] Error loading plan:', err);
      }
    });
  }

  private initForm(): void {
    this.contractForm = this.fb.group({
      // Campos que se deshabilitarán en modo edición - inicializar con {value, disabled}
      propertyId: [{ value: '', disabled: false }, Validators.required],
      startDate: [{ value: '', disabled: false }, Validators.required],
      advancePayment: [{ value: 0, disabled: false }, [Validators.min(0)]],
      depositAmount: [{ value: 0, disabled: false }, [Validators.required, Validators.min(0)]],
      depositPaid: [{ value: false, disabled: false }],
      depositPaymentDeadline: [{ value: '', disabled: false }],

      // Campos que siempre están deshabilitados (readonly - se calculan automáticamente)
      monthlyRent: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      waterFee: [{ value: 105, disabled: true }, [Validators.required, Validators.min(0)]],

      // Campos normales editables
      endDate: ['', Validators.required],
      signedDate: [''],
      notes: ['', Validators.maxLength(500)]
    });

    // Listen to property changes
    this.contractForm.get('propertyId')?.valueChanges.subscribe(propertyId => {
      this.onPropertyChange(propertyId);
    });

    // Listen to depositPaid changes
    this.contractForm.get('depositPaid')?.valueChanges.subscribe(isPaid => {
      this.onDepositPaidChange(isPaid);
    });
  }

  private loadProperties(): void {
    this.isLoadingProperties.set(true);
    this.propertyService.getAllProperties(false).subscribe({
      next: (data) => {
        const available = data.filter(p => p.status === 'DISPONIBLE');
        this.availableProperties.set(available);
        this.isLoadingProperties.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar propiedades');
        this.isLoadingProperties.set(false);
      }
    });
  }

  private loadTenants(): void {
    this.isLoadingTenants.set(true);
    this.tenantService.getAllTenants(false).subscribe({
      next: (data) => {
        const available = data.filter(t =>
          t.isActive && t.activeContractsCount === 0
        );
        this.availableTenants.set(available);
        this.isLoadingTenants.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar inquilinos');
        this.isLoadingTenants.set(false);
      }
    });
  }
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      // En modo edición: cargar datos primero, luego el contrato
      this.loadDataForEditing(id);
    } else {
      // En modo creación: solo cargar las listas
      this.loadProperties();
      this.loadTenants();
    }
  }

  /**
   * Carga propiedades y tenants antes de cargar el contrato
   * Esto asegura que las listas estén disponibles cuando se populen los datos
   */
  private loadDataForEditing(contractId: string): void {
    this.isLoadingProperties.set(true);
    this.isLoadingTenants.set(true);

    // Cargar propiedades (sin filtrar por estado aún)
    this.propertyService.getAllProperties(false).subscribe({
      next: (properties) => {
        // Guardar TODAS las propiedades temporalmente
        this.availableProperties.set(properties);
        this.isLoadingProperties.set(false);

        // Verificar si tenants también está cargado
        this.tryLoadContract(contractId);
      },
      error: (error) => {
        this.notification.error('Error al cargar propiedades');
        this.isLoadingProperties.set(false);
        this.router.navigate(['/dashboard/contracts']);
      }
    });

    // Cargar inquilinos
    this.tenantService.getAllTenants(false).subscribe({
      next: (tenants) => {
        const activeTenants = tenants.filter(t => t.isActive);
        this.availableTenants.set(activeTenants);
        this.isLoadingTenants.set(false);

        // Verificar si properties también está cargado
        this.tryLoadContract(contractId);
      },
      error: (error) => {
        this.notification.error('Error al cargar inquilinos');
        this.isLoadingTenants.set(false);
        this.router.navigate(['/dashboard/contracts']);
      }
    });
  }

  private tryLoadContract(contractId: string): void {
    // Solo cargar el contrato cuando ambas listas estén listas
    if (!this.isLoadingProperties() && !this.isLoadingTenants()) {
      this.loadContract(contractId);
    }
  }

  private loadContract(id: string): void {
    this.contractService.getContractById(id).subscribe({
      next: (contract) => {
        this.selectedContract.set(contract);
        this.populateForm(contract);
        this.disableFieldsForEditing();
      },
      error: (error) => {
        this.notification.error('Error al cargar contrato');
        this.router.navigate(['/dashboard/contracts']);
      }
    });
  }

  private disableFieldsForEditing(): void {
    this.contractForm.get('propertyId')?.disable();
    this.contractForm.get('startDate')?.disable();
    this.contractForm.get('advancePayment')?.disable();
    this.contractForm.get('depositAmount')?.disable();
    this.contractForm.get('depositPaymentDeadline')?.disable();
  }

  private populateForm(contract: ContractDetailResponse): void {
    // Asegurarse de que la propiedad actual esté en la lista
    const currentProperty = this.availableProperties().find(p => p.id === contract.property.id);
    if (!currentProperty) {
      // Si la propiedad no está en la lista, agregarla
      const propertyToAdd: PropertyResponse = {
        active: false, organizationName: '',
        id: contract.property.id,
        organizationId: contract.organizationId,
        locationId: '',
        propertyCode: contract.property.propertyCode,
        address: contract.property.address,
        propertyType: contract.property.propertyType,
        status: contract.property.status,
        monthlyRent: contract.monthlyRent,
        waterFee: contract.waterFee,
        floors: 0,
        bedrooms: 0,
        bathrooms: 0,
        totalAreaM2: 0,
        createdAt: '',
        updatedAt: '',
        location: { name: '',
          id: '',
          city:'',
          state:'',
        }
      };
      this.availableProperties.update(props => [...props, propertyToAdd]);
    }

    // Poblar el formulario con los datos del contrato
    this.contractForm.patchValue({
      propertyId: contract.property.id,
      startDate: contract.startDate,
      endDate: contract.endDate,
      signedDate: contract.signedDate || '',
      advancePayment: contract.advancePayment,
      depositAmount: contract.depositAmount,
      depositPaid: contract.depositPaid,
      depositPaymentDeadline: contract.depositPaymentDeadline || '',
      notes: contract.notes || ''
    });

    // Habilitar temporalmente los campos de solo lectura para poder setear valores
    this.contractForm.get('monthlyRent')?.enable();
    this.contractForm.get('waterFee')?.enable();

    this.contractForm.patchValue({
      monthlyRent: contract.monthlyRent,
      waterFee: contract.waterFee
    });

    // Volver a deshabilitar
    this.contractForm.get('monthlyRent')?.disable();
    this.contractForm.get('waterFee')?.disable();

    // Set document info (solo si el plan lo permite)
    if (this.planAllowsImages() && contract.contractDocumentUrl) {
      this.contractDocumentUrl.set(contract.contractDocumentUrl);
      this.contractDocumentPublicId.set(contract.contractDocumentPublicId || null);
    }

    // Set assigned tenants
    const tenants: TenantAssignment[] = contract.tenants.map(t => ({
      tenantId: t.id,
      isPrimary: t.isPrimary,
      relationship: t.relationship
    }));
    this.assignedTenants.set(tenants);
  }

  private onPropertyChange(propertyId: string): void {
    const property = this.availableProperties().find(p => p.id === propertyId);
    if (property) {
      this.contractForm.patchValue({
        monthlyRent: property.monthlyRent,
        waterFee: property.waterFee,
        depositAmount: property.monthlyRent // Default deposit = 1 month rent
      });
    }
  }

  private onDepositPaidChange(isPaid: boolean): void {
    const deadlineControl = this.contractForm.get('depositPaymentDeadline');
    if (isPaid) {
      deadlineControl?.clearValidators();
      deadlineControl?.setValue('');
    } else {
      deadlineControl?.setValidators([Validators.required]);
    }
    deadlineControl?.updateValueAndValidity();
  }

  selectTab(tab: string): void {
    // Validar que si intenta ir a documents, el plan lo permita
    if (tab === 'documents' && !this.planAllowsImages()) {
      this.notification.warning('Tu plan no permite subir documentos. Mejora tu plan para acceder a esta característica.');
      return;
    }
    this.activeTab.set(tab);
  }

  addTenant(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tenantId = select.value;

    if (!tenantId) return;

    // Check if already added
    if (this.assignedTenants().some(t => t.tenantId === tenantId)) {
      this.notification.warning('Este inquilino ya está agregado');
      select.value = '';
      return;
    }

    const newAssignment: TenantAssignment = {
      tenantId,
      isPrimary: this.assignedTenants().length === 0, // First one is primary
      relationship: ''
    };

    this.assignedTenants.update(tenants => [...tenants, newAssignment]);
    select.value = '';
  }

  removeTenant(tenantId: string): void {
    const wasPrimary = this.assignedTenants().find(t => t.tenantId === tenantId)?.isPrimary;

    this.assignedTenants.update(tenants =>
      tenants.filter(t => t.tenantId !== tenantId)
    );

    // If removed was primary, make first one primary
    if (wasPrimary && this.assignedTenants().length > 0) {
      this.setPrimaryTenant(this.assignedTenants()[0].tenantId);
    }
  }

  setPrimaryTenant(tenantId: string): void {
    this.assignedTenants.update(tenants =>
      tenants.map(t => ({
        ...t,
        isPrimary: t.tenantId === tenantId
      }))
    );
  }

  updateRelationship(tenantId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const relationship = input.value;

    this.assignedTenants.update(tenants =>
      tenants.map(t =>
        t.tenantId === tenantId ? { ...t, relationship } : t
      )
    );
  }

  getTenantName(tenantId: string): string {
    const tenant = this.availableTenants().find(t => t.id === tenantId);
    return tenant?.fullName || '';
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

  // async removeDocument(): Promise<void> {
  //   const publicId = this.contractDocumentPublicId();
  //   if (!publicId) return;
  //
  //   try {
  //     await this.cloudinaryService.deleteFile(publicId);
  //     this.contractDocumentUrl.set(null);
  //     this.contractDocumentPublicId.set(null);
  //     this.notification.success('Documento eliminado');
  //   } catch (error) {
  //     this.notification.error('Error al eliminar documento');
  //   }
  // }
    }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.notification.warning('Por favor completa todos los campos requeridos');
      return;
    }

    // Validate at least one tenant
    if (this.assignedTenants().length === 0) {
      this.notification.error('Debe agregar al menos un inquilino');
      this.selectTab('tenants');
      return;
    }

    // Validate exactly one primary
    const primaryCount = this.assignedTenants().filter(t => t.isPrimary).length;
    if (primaryCount !== 1) {
      this.notification.error('Debe haber exactamente un inquilino principal');
      this.selectTab('tenants');
      return;
    }

    // Validate dates
    const startDate = new Date(this.contractForm.value.startDate);
    const endDate = new Date(this.contractForm.value.endDate);
    if (endDate <= startDate) {
      this.notification.error('La fecha de fin debe ser posterior a la fecha de inicio');
      this.selectTab('basic');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing()) {
      this.updateContract();
    } else {
      this.createContract();
    }
  }

  private createContract(): void {
    // Usar getRawValue() para obtener TODOS los valores incluyendo los deshabilitados
    const formValue = this.contractForm.getRawValue();

    const request: CreateContractRequest = {
      propertyId: formValue.propertyId,
      tenants: this.assignedTenants(),
      startDate: this.formatDateToBackend(formValue.startDate),
      endDate: this.formatDateToBackend(formValue.endDate),
      signedDate: this.formatDateToBackend(formValue.signedDate) || undefined,
      monthlyRent: formValue.monthlyRent,
      waterFee: formValue.waterFee,
      advancePayment: formValue.advancePayment || 0,
      depositAmount: formValue.depositAmount,
      depositPaid: formValue.depositPaid,
      depositPaymentDeadline: formValue.depositPaymentDeadline || undefined,
      // Solo incluir documento si el plan lo permite
      contractDocumentUrl: this.planAllowsImages() ? (this.contractDocumentUrl() || undefined) : undefined,
      contractDocumentPublicId: this.planAllowsImages() ? (this.contractDocumentPublicId() || undefined) : undefined,
      notes: formValue.notes || undefined
    };

    this.contractService.createContract(request).subscribe({
      next: (response) => {
        this.notification.success('Contrato creado exitosamente');
        this.router.navigate(['/dashboard/contracts']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al crear contrato');
        this.isSaving.set(false);
      }
    });
  }

  private updateContract(): void {
    const id = this.selectedContract()?.id;
    if (!id) return;

    const formValue = this.contractForm.getRawValue();

    const request: UpdateContractRequest = {
      endDate: formValue.endDate,
      monthlyRent: formValue.monthlyRent,
      waterFee: formValue.waterFee,
      depositPaid: formValue.depositPaid,
      // Solo incluir documento si el plan lo permite
      contractDocumentUrl: this.planAllowsImages() ? (this.contractDocumentUrl() || undefined) : undefined,
      contractDocumentPublicId: this.planAllowsImages() ? (this.contractDocumentPublicId() || undefined) : undefined,
      notes: formValue.notes || undefined
    };

    this.contractService.updateContract(id, request).subscribe({
      next: (response) => {
        this.notification.success('Contrato actualizado exitosamente');
        this.router.navigate(['/dashboard/contracts']);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al actualizar contrato');
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/contracts']);
  }

  getCharCount(): number {
    return this.contractForm.get('notes')?.value?.length || 0;
  }

  getPlanName(): string {
    return this.planService.getPlanName();
  }
  private formatDateToBackend(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`; // Agregar la hora
  }
}
