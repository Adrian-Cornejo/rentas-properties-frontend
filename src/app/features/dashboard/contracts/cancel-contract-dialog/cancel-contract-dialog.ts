// src/app/features/dashboard/contracts/cancel-contract-dialog/cancel-contract-dialog.component.ts
import { Component, inject, signal, computed, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContractDetailResponse } from '../../../../core/models/contract/contract-detail-response';
import { CancelContractRequest } from '../../../../core/models/contract/cancel-contract-request';

@Component({
  selector: 'app-cancel-contract-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './cancel-contract-dialog.html',
  styleUrl: './cancel-contract-dialog.css'
})
export class CancelContractDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) contract!: ContractDetailResponse;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<CancelContractRequest>();

  cancelForm!: FormGroup;

  depositHandling = signal<'full' | 'partial' | 'retain'>('full');

  showPartialAmount = computed(() => this.depositHandling() === 'partial');
  showDeductionReason = computed(() =>
    this.depositHandling() === 'partial' || this.depositHandling() === 'retain'
  );

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.cancelForm = this.fb.group({
      cancellationReason: ['', [Validators.required, Validators.maxLength(500)]],
      cancellationDate: [today, Validators.required],
      cancelPendingPayments: [true],
      depositReturnAmount: [{ value: this.contract.depositAmount, disabled: true }],
      depositDeductionReason: ['']
    });
  }

  onDepositOptionChange(option: 'full' | 'partial' | 'retain'): void {
    this.depositHandling.set(option);
    this.updateDepositAmount(option);
  }

  private updateDepositAmount(option: 'full' | 'partial' | 'retain'): void {
    const depositAmount = this.contract.depositAmount;

    switch (option) {
      case 'full':
        this.cancelForm.patchValue({
          depositReturnAmount: depositAmount,
          depositDeductionReason: ''
        });
        this.cancelForm.get('depositReturnAmount')?.disable();
        this.cancelForm.get('depositDeductionReason')?.clearValidators();
        break;

      case 'partial':
        this.cancelForm.get('depositReturnAmount')?.enable();
        this.cancelForm.patchValue({
          depositReturnAmount: depositAmount * 0.5
        });
        this.cancelForm.get('depositDeductionReason')?.setValidators([
          Validators.required,
          Validators.maxLength(500)
        ]);
        break;

      case 'retain':
        this.cancelForm.patchValue({
          depositReturnAmount: 0
        });
        this.cancelForm.get('depositReturnAmount')?.disable();
        this.cancelForm.get('depositDeductionReason')?.setValidators([
          Validators.required,
          Validators.maxLength(500)
        ]);
        break;
    }

    this.cancelForm.get('depositDeductionReason')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.cancelForm.invalid) {
      Object.keys(this.cancelForm.controls).forEach(key => {
        this.cancelForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.cancelForm.getRawValue();

    const request: CancelContractRequest = {
      cancellationReason: formValue.cancellationReason,
      cancellationDate: formValue.cancellationDate,
      cancelPendingPayments: formValue.cancelPendingPayments,
      returnDeposit: this.depositHandling() !== 'retain',
      depositReturnAmount: this.depositHandling() === 'retain'
        ? 0
        : formValue.depositReturnAmount,
      depositDeductionReason: formValue.depositDeductionReason || undefined
    };

    this.confirm.emit(request);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
