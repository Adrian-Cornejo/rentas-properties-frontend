export interface PaymentResponse {
  id: string;
  contractId: string;
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
  paymentType: 'RENTA' | 'AGUA' | 'DEPOSITO' | 'ADELANTO';
  paymentDate: string;
  dueDate: string;
  periodMonth: number;
  periodYear: number;
  amount: number;
  lateFee: number;
  totalAmount: number;
  status: 'PENDIENTE' | 'PAGADO' | 'ATRASADO' | 'PARCIAL';
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
