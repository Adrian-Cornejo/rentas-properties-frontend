import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MaintenanceRecordService } from '../../../../core/services/maintenance-record.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaintenanceRecordDetailResponse } from '../../../../core/models/maintenanceRecord/maintence-image';

@Component({
  selector: 'app-maintenance-complete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './maintenance-complete.html',
  styleUrl: './maintenance-complete.css',
})
export class MaintenanceCompleteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private maintenanceService = inject(MaintenanceRecordService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  record = signal<MaintenanceRecordDetailResponse | null>(null);

  completeForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    const recordId = this.route.snapshot.paramMap.get('id');
    if (recordId) {
      this.loadRecord(recordId);
    }
  }

  initForm(): void {
    this.completeForm = this.fb.group({
      actualCost: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadRecord(id: string): void {
    this.isLoading.set(true);
    this.maintenanceService.getMaintenanceRecordById(id).subscribe({
      next: (record) => {
        this.record.set(record);

        // Pre-fill with estimated cost if available
        if (record.estimatedCost) {
          this.completeForm.patchValue({ actualCost: record.estimatedCost });
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar el registro de mantenimiento');
        this.router.navigate(['/dashboard/maintenance']);
      }
    });
  }

  onSubmit(): void {
    if (this.completeForm.invalid || !this.record()) {
      this.completeForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const recordId = this.record()!.id;
    const actualCost = this.completeForm.value.actualCost;

    this.maintenanceService.markAsCompleted(recordId, actualCost).subscribe({
      next: () => {
        this.notification.success('Mantenimiento marcado como completado exitosamente');
        this.router.navigate(['/dashboard/maintenance']);
      },
      error: (error) => {
        this.notification.error('Error al completar el mantenimiento');
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/maintenance']);
  }

  getTypeLabel(): string {
    if (!this.record()) return '';
    const typeMap: Record<string, string> = {
      'PREVENTIVO': 'Preventivo',
      'CORRECTIVO': 'Correctivo',
      'EMERGENCIA': 'Emergencia'
    };
    return typeMap[this.record()!.maintenanceType] || this.record()!.maintenanceType;
  }

  getCategoryLabel(): string {
    if (!this.record() || !this.record()!.category) return 'Sin categoría';

    const categoryMap: Record<string, string> = {
      'PLOMERIA': 'Plomería',
      'ELECTRICIDAD': 'Electricidad',
      'PINTURA': 'Pintura',
      'LIMPIEZA': 'Limpieza',
      'CARPINTERIA': 'Carpintería',
      'JARDINERIA': 'Jardinería',
      'AIRE_ACONDICIONADO': 'Aire Acondicionado',
      'OTRO': 'Otro'
    };
    return categoryMap[this.record()!.category!] || this.record()!.category!;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getCostDifference(): number {
    const rec = this.record();
    const actualCost = this.completeForm.value.actualCost;

    if (!rec || !rec.estimatedCost || !actualCost) return 0;

    return actualCost - rec.estimatedCost;
  }

  getCostDifferencePercentage(): number {
    const rec = this.record();
    const actualCost = this.completeForm.value.actualCost;

    if (!rec || !rec.estimatedCost || !actualCost) return 0;

    return ((actualCost - rec.estimatedCost) / rec.estimatedCost) * 100;
  }
}
