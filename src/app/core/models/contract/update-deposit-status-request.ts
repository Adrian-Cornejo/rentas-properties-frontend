export interface UpdateDepositStatusRequest {
  depositPaid: boolean;
  depositStatus: 'PENDIENTE' | 'PAGADO' | 'DEVUELTO_TOTAL' | 'DEVUELTO_PARCIAL' | 'NO_DEVUELTO';
  depositReturnAmount?: number;
  depositReturnDate?: string;
  depositDeductionReason?: string;
}
