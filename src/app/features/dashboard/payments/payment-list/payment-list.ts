import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { PaymentService } from '../../../../core/services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentResponse } from '../../../../core/models/payment/payment-response';
import { PaymentCardComponent } from '../payment-card/payment-card';

interface PropertyPaymentGroup {
  propertyCode: string;
  propertyAddress: string;
  payments: PaymentResponse[];
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
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
  expandedProperties = signal<Set<string>>(new Set());

  groupedPayments = computed(() => {
    let pmts = this.payments();

    // Apply status filter
    if (this.filterStatus() !== 'ALL') {
      pmts = pmts.filter(p => p.status === this.filterStatus());
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

    // Group by property
    const groups = new Map<string, PropertyPaymentGroup>();

    pmts.forEach(payment => {
      const key = payment.propertyCode;

      if (!groups.has(key)) {
        groups.set(key, {
          propertyCode: payment.propertyCode,
          propertyAddress: payment.propertyAddress,
          payments: [],
          totalAmount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          overdueAmount: 0
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

    return Array.from(groups.values()).sort((a, b) =>
      a.propertyCode.localeCompare(b.propertyCode)
    );
  });

  totalPayments = computed(() => this.payments().length);
  pendingCount = computed(() => this.payments().filter(p => p.status === 'PENDIENTE').length);
  paidCount = computed(() => this.payments().filter(p => p.status === 'PAGADO').length);
  overdueCount = computed(() => this.payments().filter(p => p.status === 'ATRASADO').length);

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

  toggleProperty(propertyCode: string): void {
    const expanded = new Set(this.expandedProperties());
    if (expanded.has(propertyCode)) {
      expanded.delete(propertyCode);
    } else {
      expanded.add(propertyCode);
    }
    this.expandedProperties.set(expanded);
  }

  isPropertyExpanded(propertyCode: string): boolean {
    return this.expandedProperties().has(propertyCode);
  }

  expandAll(): void {
    const allProperties = new Set(this.groupedPayments().map(g => g.propertyCode));
    this.expandedProperties.set(allProperties);
  }

  collapseAll(): void {
    this.expandedProperties.set(new Set());
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
