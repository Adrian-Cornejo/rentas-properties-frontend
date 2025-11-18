export interface CreatePaymentRequest {
  contractId: string;
  paymentType: 'RENTA' | 'AGUA' | 'DEPOSITO' | 'ADELANTO';
  paymentDate: string;
  dueDate: string;
  periodMonth: number;
  periodYear: number;
  amount: number;
  lateFee?: number;
}
