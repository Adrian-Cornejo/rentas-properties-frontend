import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { PaymentService } from '../../../../core/services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentResponse } from '../../../../core/models/payment/payment-response';
import { PaymentCardComponent } from '../payment-card/payment-card';

interface ContractPaymentGroup {
  contractId: string;
  contractNumber: string;
  contractStatus: string;
  propertyCode: string;
  propertyAddress: string;
  payments: PaymentResponse[];
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  cancelledAmount: number;
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    PaymentCardComponent
  ],
  templateUrl: './payment-list.html',
  styleUrl: '../payments.css',
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);
  payments = signal<PaymentResponse[]>([]);
  filterStatus = signal<string>('ALL');
  searchTerm = signal<string>('');
  expandedContracts = signal<Set<string>>(new Set());

  showCancelledContracts = signal<boolean>(false);

  groupedPayments = computed(() => {
    let pmts = this.payments();

    // Apply status filter
    if (this.filterStatus() !== 'ALL') {
      pmts = pmts.filter(p => p.status === this.filterStatus());
    }

    if (!this.showCancelledContracts()) {
      pmts = pmts.filter(p => p.contractStatus !== 'CANCELADO');
    }

    // Apply search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      pmts = pmts.filter(p =>
        p.contractNumber.toLowerCase().includes(term) ||
        p.propertyCode.toLowerCase().includes(term) ||
        p.propertyAddress.toLowerCase().includes(term)
      );
    }

    // Group by contract
    const groups = new Map<string, ContractPaymentGroup>();

    pmts.forEach(payment => {
      const key = payment.contractId;

      if (!groups.has(key)) {
        groups.set(key, {
          contractId: payment.contractId,
          contractNumber: payment.contractNumber,
          contractStatus: payment.contractStatus, // ← AGREGAR
          propertyCode: payment.propertyCode,
          propertyAddress: payment.propertyAddress,
          payments: [],
          totalAmount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          overdueAmount: 0,
          cancelledAmount: 0
        });
      }

      const group = groups.get(key)!;
      group.payments.push(payment);
      group.totalAmount += payment.totalAmount;

      if (payment.status === 'PENDIENTE') {
        group.pendingAmount += payment.totalAmount;
      } else if (payment.status === 'PAGADO') {
        group.paidAmount += payment.totalAmount;
      } else if (payment.status === 'ATRASADO') {
        group.overdueAmount += payment.totalAmount;
      } else if (payment.status === 'CANCELADO') {
        group.cancelledAmount += payment.totalAmount;
      }
    });

    // Sort payments within each group by date (most recent first)
    groups.forEach(group => {
      group.payments.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });
    });

    // ← NUEVO: Ordenar grupos - Contratos activos primero, luego por propiedad y contrato
    return Array.from(groups.values()).sort((a, b) => {
      // Primero: Contratos activos al inicio
      if (a.contractStatus === 'ACTIVO' && b.contractStatus !== 'ACTIVO') return -1;
      if (a.contractStatus !== 'ACTIVO' && b.contractStatus === 'ACTIVO') return 1;

      // Segundo: Por código de propiedad
      const propCompare = a.propertyCode.localeCompare(b.propertyCode);
      if (propCompare !== 0) return propCompare;

      // Tercero: Por número de contrato (más reciente primero)
      return b.contractNumber.localeCompare(a.contractNumber);
    });
  });

  totalPayments = computed(() => this.payments().length);
  pendingCount = computed(() => this.payments().filter(p => p.status === 'PENDIENTE').length);
  paidCount = computed(() => this.payments().filter(p => p.status === 'PAGADO').length);
  overdueCount = computed(() => this.payments().filter(p => p.status === 'ATRASADO').length);
  cancelledCount = computed(() => this.payments().filter(p => p.status === 'CANCELADO').length);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.paymentService.getAllPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar pagos');
        this.isLoading.set(false);
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus.set(status);
  }

  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  toggleContract(contractId: string): void {
    const expanded = new Set(this.expandedContracts());
    if (expanded.has(contractId)) {
      expanded.delete(contractId);
    } else {
      expanded.add(contractId);
    }
    this.expandedContracts.set(expanded);
  }

  isContractExpanded(contractId: string): boolean {
    return this.expandedContracts().has(contractId);
  }

  expandAll(): void {
    const allContracts = new Set(this.groupedPayments().map(g => g.contractId));
    this.expandedContracts.set(allContracts);
  }

  collapseAll(): void {
    this.expandedContracts.set(new Set());
  }

  // ← NUEVO: Toggle para mostrar/ocultar contratos cancelados
  toggleCancelledContracts(): void {
    this.showCancelledContracts.update(v => !v);
  }

  getContractStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVO':
        return 'Activo';
      case 'VENCIDO':
        return 'Vencido';
      case 'RENOVADO':
        return 'Renovado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getContractStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVO':
        return 'status-active';
      case 'VENCIDO':
        return 'status-expired';
      case 'RENOVADO':
        return 'status-renewed';
      case 'CANCELADO':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  onMarkAsPaid(paymentId: string): void {
    this.router.navigate(['/dashboard/payments/mark-paid', paymentId]);
  }

  onAddLateFee(paymentId: string): void {
    this.router.navigate(['/dashboard/payments/add-late-fee', paymentId]);
  }
}
