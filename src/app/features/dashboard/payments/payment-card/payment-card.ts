import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentResponse } from '../../../../core/models/payment/payment-response';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.html',
  styleUrl: '../payments.css',
})
export class PaymentCardComponent {
  @Input({ required: true }) payment!: PaymentResponse;
  @Output() markAsPaid = new EventEmitter<string>();
  @Output() addLateFee = new EventEmitter<string>();

  getStatusClass(): string {
    const statusMap: Record<string, string> = {
      'PAGADO': 'success',
      'PENDIENTE': 'warning',
      'ATRASADO': 'error',
      'PARCIAL': 'info'
    };
    return statusMap[this.payment.status] || 'default';
  }

  getStatusLabel(): string {
    const labelMap: Record<string, string> = {
      'PAGADO': 'Pagado',
      'PENDIENTE': 'Pendiente',
      'ATRASADO': 'Atrasado',
      'PARCIAL': 'Parcial'
    };
    return labelMap[this.payment.status] || this.payment.status;
  }

  getTypeLabel(): string {
    const typeMap: Record<string, string> = {
      'RENTA': 'Renta',
      'AGUA': 'Agua',
      'DEPOSITO': 'Depósito',
      'ADELANTO': 'Adelanto'
    };
    return typeMap[this.payment.paymentType] || this.payment.paymentType;
  }

  getPeriodLabel(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[this.payment.periodMonth - 1]} ${this.payment.periodYear}`;
  }

  formatDate(dateString: string): string {
    // Manejar tanto LocalDate (YYYY-MM-DD) como LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  onMarkAsPaid(): void {
    this.markAsPaid.emit(this.payment.id);
  }

  onAddLateFee(): void {
    this.addLateFee.emit(this.payment.id);
  }
}
