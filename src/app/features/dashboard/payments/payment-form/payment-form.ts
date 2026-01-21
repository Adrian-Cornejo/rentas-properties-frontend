import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { MarkAsPaidRequest } from '../../../../core/models/payment/make-asi-paid-request';
import { AddLateFeeRequest } from '../../../../core/models/payment/add-late-free-request';
import { PaymentDetailResponse } from '../../../../core/models/payment/payment-detail-response';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePicker
  ],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css',
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSaving = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  formType = signal<'mark-paid' | 'add-late-fee'>('mark-paid');
  payment = signal<PaymentDetailResponse | null>(null);

  paymentForm!: FormGroup;

  ngOnInit(): void {
    const paymentId = this.route.snapshot.paramMap.get('id');
    const path = this.route.snapshot.routeConfig?.path || '';

    if (path.includes('mark-paid')) {
      this.formType.set('mark-paid');
      this.initMarkAsPaidForm();
    } else if (path.includes('add-late-fee')) {
      this.formType.set('add-late-fee');
      this.initAddLateFeeForm();
    }

    if (paymentId) {
      this.loadPayment(paymentId);
    }
  }

  paymentMethodOptions = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Depósito Bancario', value: 'DEPOSITO' },
    { label: 'Tarjeta', value: 'TARJETA' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Otro', value: 'OTRO' }
  ];

  initMarkAsPaidForm(): void {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', [Validators.required, Validators.maxLength(50)]],
      referenceNumber: ['', [Validators.maxLength(100)]],
      paidAt: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(500)]]
    });

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    this.paymentForm.patchValue({ paidAt: today });
  }

  initAddLateFeeForm(): void {
    this.paymentForm = this.fb.group({
      lateFeeAmount: ['', [Validators.required, Validators.min(0.01)]],
      reason: ['', [Validators.maxLength(500)]],
      automatic: [false]
    });
  }

  loadPayment(id: string): void {
    this.isLoading.set(true);
    this.paymentService.getPaymentById(id).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar el pago');
        this.router.navigate(['/dashboard/payments']);
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.payment()) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const paymentId = this.payment()!.id;

    if (this.formType() === 'mark-paid') {
      this.submitMarkAsPaid(paymentId);
    } else {
      //this.submitAddLateFee(paymentId);
    }
  }

  submitMarkAsPaid(paymentId: string): void {
    const paidAtDate = this.paymentForm.value.paidAt;
    const paidAtDateTime = paidAtDate ? `${paidAtDate}T00:00:00` : undefined;

    const request: MarkAsPaidRequest = {
      paymentMethod: this.paymentForm.value.paymentMethod,
      referenceNumber: this.paymentForm.value.referenceNumber || undefined,
      paidAt: this.formatDateToBackend(paidAtDate),
      notes: this.paymentForm.value.notes || undefined
    };

    this.paymentService.markAsPaid(paymentId, request).subscribe({
      next: () => {
        this.notification.success('Pago marcado como pagado exitosamente');
        this.router.navigate(['/dashboard/payments']);
      },
      error: (error) => {
        this.notification.error('Error al marcar el pago como pagado');
        this.isSaving.set(false);
      }
    });
  }
  submitAddLateFee(paymentId: string): void {
    const request: AddLateFeeRequest = {
      lateFeeAmount: this.paymentForm.value.lateFeeAmount,
      reason: this.paymentForm.value.reason || undefined,
      automatic: this.paymentForm.value.automatic
    };

    this.paymentService.addLateFee(paymentId, request).subscribe({
      next: () => {
        this.notification.success('Recargo por mora agregado exitosamente');
        this.router.navigate(['/dashboard/payments']);
      },
      error: (error) => {
        this.notification.error('Error al agregar recargo por mora');
        this.isSaving.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/payments']);
  }

  getTypeLabel(): string {
    const typeMap: Record<string, string> = {
      'RENTA': 'Renta',
      'AGUA': 'Agua',
      'DEPOSITO': 'Depósito',
      'ADELANTO': 'Adelanto'
    };
    return this.payment() ? typeMap[this.payment()!.paymentType] : '';
  }

  getPeriodLabel(): string {
    if (!this.payment()) return '';
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const p = this.payment()!;
    return `${months[p.periodMonth - 1]} ${p.periodYear}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
