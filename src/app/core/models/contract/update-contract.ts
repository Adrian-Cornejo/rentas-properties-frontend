export interface UpdateContractRequest {
  endDate?: string;
  monthlyRent?: number;
  waterFee?: number;
  depositPaid?: boolean;
  contractDocumentUrl?: string;
  contractDocumentPublicId?: string;
  notes?: string;
}
