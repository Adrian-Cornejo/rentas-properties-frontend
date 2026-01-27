import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { ContractService } from '../../../../core/services/contract.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ContractResponse } from '../../../../core/models/contract/contract-response';
import { ContractDetailResponse } from '../../../../core/models/contract/contract-detail-response';
import { CancelContractRequest } from '../../../../core/models/contract/cancel-contract-request';
import { ContractCardComponent } from '../contract-card/contract-card';
import {CancelContractDialogComponent} from '../cancel-contract-dialog/cancel-contract-dialog';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    ContractCardComponent,
    CancelContractDialogComponent  // ← AGREGAR AL IMPORTS
  ],
  templateUrl: './contract-list.html',
  styleUrl: '../contracts.css',
})
export class ContractListComponent implements OnInit {
  private contractService = inject(ContractService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Signals
  isLoading = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  showCancelDialog = signal<boolean>(false);  // ← AGREGAR
  contracts = signal<ContractResponse[]>([]);
  contractToDelete = signal<string | null>(null);
  contractToCancel = signal<ContractDetailResponse | null>(null);  // ← AGREGAR
  filterStatus = signal<string>('ALL');
  searchTerm = signal<string>('');

  // Computed
  filteredContracts = computed(() => {
    let ctrs = this.contracts();

    // Filter by status
    if (this.filterStatus() === 'ACTIVO') {
      ctrs = ctrs.filter(c => c.status === 'ACTIVO');
    } else if (this.filterStatus() === 'VENCIDO') {
      ctrs = ctrs.filter(c => c.status === 'VENCIDO');
    } else if (this.filterStatus() === 'RENOVADO') {
      ctrs = ctrs.filter(c => c.status === 'RENOVADO');
    } else if (this.filterStatus() === 'CANCELADO') {
      ctrs = ctrs.filter(c => c.status === 'CANCELADO');
    } else if (this.filterStatus() === 'EXPIRING_SOON') {
      ctrs = ctrs.filter(c => this.isExpiringSoon(c.endDate) && c.status === 'ACTIVO');
    }

    // Search
    const term = this.searchTerm().toLowerCase();
    if (term) {
      ctrs = ctrs.filter(c =>
        c.contractNumber.toLowerCase().includes(term) ||
        c.propertyCode.toLowerCase().includes(term) ||
        c.propertyAddress.toLowerCase().includes(term)
      );
    }

    return ctrs;
  });

  totalContracts = computed(() => this.contracts().length);

  activeCount = computed(() =>
    this.contracts().filter(c => c.status === 'ACTIVO').length
  );

  expiringSoonCount = computed(() =>
    this.contracts().filter(c =>
      this.isExpiringSoon(c.endDate) && c.status === 'ACTIVO'
    ).length
  );

  expiredCount = computed(() =>
    this.contracts().filter(c => c.status === 'VENCIDO').length
  );

  ngOnInit(): void {
    this.loadContracts();
  }

  private loadContracts(): void {
    this.isLoading.set(true);

    this.contractService.getAllContracts(true).subscribe({
      next: (data) => {
        this.contracts.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al cargar contratos');
        this.isLoading.set(false);
      }
    });
  }

  startCreating(): void {
    this.router.navigate(['/dashboard/contracts/new']);
  }

  onEdit(id: string): void {
    this.router.navigate(['/dashboard/contracts/edit', id]);
  }

  onCancel(id: string): void {
    this.isLoading.set(true);

    // Cargar el detalle completo del contrato
    this.contractService.getContractById(id).subscribe({
      next: (contract) => {
        this.contractToCancel.set(contract);
        this.showCancelDialog.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar el contrato');
        this.isLoading.set(false);
      }
    });
  }

  onCancelDialogClose(): void {
    this.showCancelDialog.set(false);
    this.contractToCancel.set(null);
  }

  onConfirmCancellation(request: CancelContractRequest): void {
    const contractId = this.contractToCancel()?.id;
    if (!contractId) return;

    this.isLoading.set(true);

    this.contractService.cancelContract(contractId, request).subscribe({
      next: (response) => {
        this.notification.success(
          `Contrato ${response.contractNumber} cancelado exitosamente`
        );
        this.showCancelDialog.set(false);
        this.contractToCancel.set(null);
        this.loadContracts(); // Recargar la lista
      },
      error: (error) => {
        this.notification.error(
          error.error?.message || 'Error al cancelar el contrato'
        );
        this.isLoading.set(false);
      }
    });
  }

  onDelete(id: string): void {
    this.confirmDelete(id);
  }

  confirmDelete(id: string): void {
    this.contractToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.contractToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const id = this.contractToDelete();
    if (!id) return;

    this.isLoading.set(true);

    this.contractService.deleteContract(id).subscribe({
      next: () => {
        this.notification.success('Contrato eliminado exitosamente');
        this.loadContracts();
        this.cancelDelete();
      },
      error: (error) => {
        this.notification.error(error.message || 'Error al eliminar contrato');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  private isExpiringSoon(endDate: string): boolean {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }
}
