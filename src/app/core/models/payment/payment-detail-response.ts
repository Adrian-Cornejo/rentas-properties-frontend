import { PaymentResponse } from './payment-response';
export interface ContractDto {
  id: string;
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
}

export interface PaymentDetailResponse extends PaymentResponse {
  contract: ContractDto;
  referenceNumber?: string;
  notes?: string;
  collectedBy?: string;
  collectedByName?: string;
}
