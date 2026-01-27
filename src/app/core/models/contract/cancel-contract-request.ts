export interface CancelContractRequest {
  cancellationReason: string;
  cancellationDate?: string;
  returnDeposit?: boolean;
  depositReturnAmount?: number;
  depositDeductionReason?: string;
  cancelPendingPayments?: boolean;
}
