export interface TenantAssignment {
  tenantId: string;
  isPrimary: boolean;
  relationship?: string;
}

export interface CreateContractRequest {
  propertyId: string;
  tenants: TenantAssignment[];
  startDate: string; 
  endDate: string;
  signedDate?: string;
  monthlyRent: number;
  waterFee: number;
  advancePayment?: number;
  depositAmount: number;
  depositPaid?: boolean;
  depositPaymentDeadline?: string;
  contractDocumentUrl?: string;
  contractDocumentPublicId?: string;
  notes?: string;
}
