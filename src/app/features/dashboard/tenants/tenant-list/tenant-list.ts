import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TenantService } from '../../../../core/services/tenant.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TenantResponse } from '../../../../core/models/tenents/tenant-response';
import { TenantCardComponent } from '../tenant-card/tenant-card';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    TenantCardComponent
  ],
  templateUrl: './tenant-list.html',
  styleUrl: '../tenants.css',
})
export class TenantListComponent implements OnInit {
  private tenantService = inject(TenantService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Signals
  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  tenants = signal<TenantResponse[]>([]);
  tenantToDelete = signal<string | null>(null);
  filterStatus = signal<string>('ALL');
  searchTerm = signal<string>('');

  // Computed
  filteredTenants = computed(() => {
    let tnts = this.tenants();

    // Filter by status
    if (this.filterStatus() === 'ACTIVE') {
      tnts = tnts.filter(t => t.isActive);
    } else if (this.filterStatus() === 'INACTIVE') {
      tnts = tnts.filter(t => !t.isActive);
    } else if (this.filterStatus() === 'WITH_CONTRACTS') {
      tnts = tnts.filter(t => t.activeContractsCount > 0);
    }

    // Search
    const term = this.searchTerm().toLowerCase();
    if (term) {
      tnts = tnts.filter(t =>
        t.fullName.toLowerCase().includes(term) ||
        t.phone.includes(term) ||
        t.email?.toLowerCase().includes(term)
      );
    }

    return tnts;
  });

  activeCount = computed(() =>
    this.tenants().filter(t => t.isActive).length
  );

  withContractsCount = computed(() =>
    this.tenants().filter(t => t.activeContractsCount > 0).length
  );

  totalOccupants = computed(() =>
    this.tenants().reduce((sum, t) => sum + t.numberOfOccupants, 0)
  );

  ngOnInit(): void {
    this.loadTenants();
  }

  private loadTenants(): void {
    this.isLoading.set(true);

    this.tenantService.getAllTenants(true).subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar inquilinos');
        this.isLoading.set(false);
      }
    });
  }

  startCreating(): void {
    this.router.navigate(['/dashboard/tenants/new']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/dashboard/tenants/edit', id]);
  }

  onDelete(id: string): void {
    this.confirmDelete(id);
  }

  confirmDelete(id: string): void {
    this.tenantToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.tenantToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteTenant(): void {
    const id = this.tenantToDelete();
    if (!id) return;

    this.tenantService.deleteTenant(id).subscribe({
      next: () => {
        this.notification.success('Inquilino eliminado exitosamente');
        this.loadTenants();
        this.cancelDelete();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al eliminar inquilino');
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
}
