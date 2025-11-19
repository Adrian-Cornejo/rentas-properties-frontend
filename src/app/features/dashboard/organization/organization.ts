import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { OrganizationDetailResponse } from '../../../core/models/organization/organization-detail-response';
import { UpdateOrganizationRequest } from '../../../core/models/organization/update-organization-request';
import { OrganizationStatsResponse } from '../../../core/models/organization/organization-stats-response';
import {CreateOrganizationRequest} from '../../../core/models/organization/organization-request';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkeletonModule
  ],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class OrganizationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private themeService = inject(ThemeService);

  // Signals
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isCreatingMode = signal<boolean>(false);
  organization = signal<OrganizationDetailResponse | null>(null);
  stats = signal<OrganizationStatsResponse | null>(null);
  showConfirmDialog = signal<boolean>(false);

  // Form
  organizationForm!: FormGroup;

  // Computed
  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  isOwner = computed(() => {
    const user = this.currentUser();
    const org = this.organization();
    return user?.id === org?.owner?.id;
  });

  isDarkMode = this.themeService.isDarkMode;

  ngOnInit(): void {
    this.initForm();
    this.loadOrganizationData();
  }

  private initForm(): void {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', Validators.maxLength(500)],
      primaryColor: ['#3B82F6', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      secondaryColor: ['#10B981', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      logoUrl: [''],
      logoPublicId: [''],
      codeIsReusable: [true]
    });

    this.organizationForm.disable();
  }

  private loadOrganizationData(): void {
    this.isLoading.set(true);

    this.organizationService.getMyOrganization().subscribe({
      next: (data) => {
        this.organization.set(data);
        this.patchFormValues(data);
        this.loadStats();
      },
      error: (error) => {
        if (error.status === 404) {
          console.log('Usuario sin organización asignada');
        } else {
          // this.notification.error(error.message || 'Error al cargar organización');
        }
        this.isLoading.set(false);
      }
    });
  }

  private loadStats(): void {
    this.organizationService.getMyOrganizationStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.isLoading.set(false);
      }
    });
  }

  private patchFormValues(data: OrganizationDetailResponse): void {
    this.organizationForm.patchValue({
      name: data.name,
      description: data.description,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      logoUrl: data.logoUrl,
      logoPublicId: data.logoPublicId,
      codeIsReusable: data.codeIsReusable
    });
  }

  startCreating(): void {
    this.isCreatingMode.set(true);
    this.organizationForm.enable();
    this.organizationForm.reset({
      name: '',
      description: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      logoUrl: '',
      logoPublicId: '',
      codeIsReusable: true
    });
  }

  cancelCreating(): void {
    this.isCreatingMode.set(false);
    this.organizationForm.disable();
    this.organizationForm.reset();
  }

  createOrganization(): void {
    if (this.organizationForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    const request: CreateOrganizationRequest = {
      name: this.organizationForm.value.name,
      description: this.organizationForm.value.description,
      primaryColor: this.organizationForm.value.primaryColor,
      secondaryColor: this.organizationForm.value.secondaryColor
    };

    this.organizationService.createOrganization(request).subscribe({
      next: (data) => {
        this.organization.set(data);
        this.patchFormValues(data);
        this.isCreatingMode.set(false);
        this.organizationForm.disable();
        this.isSaving.set(false);
        this.notification.success('Organización creada exitosamente');

        this.themeService.setOrganizationColors(data.primaryColor, data.secondaryColor);
        this.loadStats();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al crear organización');
        this.isSaving.set(false);
      }
    });
  }

  toggleEditMode(): void {
    if (this.isEditMode()) {
      this.cancelEdit();
    } else {
      this.isEditMode.set(true);
      this.organizationForm.enable();
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.organizationForm.disable();
    const org = this.organization();
    if (org) {
      this.patchFormValues(org);
    }
  }

  saveChanges(): void {
    if (this.organizationForm.invalid) {
      this.notification.error('Por favor completa todos los campos requeridos');
      return;
    }

    const org = this.organization();
    if (!org) return;

    this.isSaving.set(true);

    const request: UpdateOrganizationRequest = {
      name: this.organizationForm.value.name,
      description: this.organizationForm.value.description,
      primaryColor: this.organizationForm.value.primaryColor,
      secondaryColor: this.organizationForm.value.secondaryColor,
      logoUrl: this.organizationForm.value.logoUrl,
      logoPublicId: this.organizationForm.value.logoPublicId,
      codeIsReusable: this.organizationForm.value.codeIsReusable
    };

    this.organizationService.updateOrganization(org.id, request).subscribe({
      next: (data) => {
        this.organization.set(data);
        this.patchFormValues(data);
        this.isEditMode.set(false);
        this.organizationForm.disable();
        this.isSaving.set(false);
        this.notification.success('Organización actualizada exitosamente');

        this.themeService.setOrganizationColors(data.primaryColor, data.secondaryColor);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al actualizar organización');
        this.isSaving.set(false);
      }
    });
  }

  openRegenerateDialog(): void {
    this.showConfirmDialog.set(true);
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog.set(false);
  }

  confirmRegenerate(): void {
    const org = this.organization();
    if (!org) return;

    this.closeConfirmDialog();
    this.isLoading.set(true);

    this.organizationService.regenerateInvitationCode(org.id).subscribe({
      next: (data) => {
        this.organization.set(data);
        this.isLoading.set(false);
        this.notification.success('Código de invitación regenerado exitosamente');
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al regenerar código');
        this.isLoading.set(false);
      }
    });
  }

  copyInvitationCode(): void {
    const org = this.organization();
    if (!org?.invitationCode) return;

    navigator.clipboard.writeText(org.invitationCode).then(() => {
      this.notification.success('Código copiado al portapapeles');
    }).catch(() => {
      this.notification.error('Error al copiar código');
    });
  }

  getSubscriptionStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'status-success',
      'TRIAL': 'status-info',
      'EXPIRED': 'status-warning',
      'CANCELLED': 'status-danger'
    };
    return statusMap[status] || 'status-info';
  }

  getSubscriptionStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Activa',
      'TRIAL': 'Prueba',
      'EXPIRED': 'Expirada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}
