import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractResponse } from '../../../../core/models/contract/contract-response';

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-card.html',
  styleUrl: '../contracts.css',
})
export class ContractCardComponent {
  @Input({ required: true }) contract!: ContractResponse;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  daysUntilExpiration = computed(() => {
    if (!this.contract) return 0;
    const end = new Date(this.contract.endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  isExpiringSoon = computed(() => {
    const days = this.daysUntilExpiration();
    return days > 0 && days <= 30 && this.contract.status === 'ACTIVO';
  });

  isExpired = computed(() => {
    const days = this.daysUntilExpiration();
    return days < 0 && this.contract.status === 'ACTIVO';
  });

  onEdit(): void {
    this.edit.emit(this.contract.id);
  }

  onDelete(): void {
    this.delete.emit(this.contract.id);
  }

  getStatusLabel(): string {
    switch (this.contract.status) {
      case 'ACTIVO':
        return 'Activo';
      case 'VENCIDO':
        return 'Vencido';
      case 'RENOVADO':
        return 'Renovado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return this.contract.status;
    }
  }

  getStatusClass(): string {
    switch (this.contract.status) {
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

  getDepositStatusLabel(): string {
    return this.contract.depositPaid ? 'Pagado' : 'Pendiente';
  }

  getDepositStatusClass(): string {
    return this.contract.depositPaid ? 'deposit-paid' : 'deposit-pending';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
}
