export interface MarkAsPaidRequest {
  paymentMethod: string;
  referenceNumber?: string;
  paidAt?: string;
  notes?: string;
}
