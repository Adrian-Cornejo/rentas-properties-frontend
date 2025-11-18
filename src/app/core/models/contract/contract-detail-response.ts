import {ContractResponse} from './contract-response';

export interface PropertyDto {
  id: string;
  propertyCode: string;
  address: string;
  propertyType: string;
  status: string;
}

export interface TenantDto {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  relationship?: string;
}

export interface ContractDetailResponse extends ContractResponse {
  property: PropertyDto;
  tenants: TenantDto[];
  signedDate?: string;
  advancePayment: number;
  depositPaymentDeadline?: string;
  depositStatus: string;
  depositReturnAmount?: number;
  depositReturnDate?: string;
  depositDeductionReason?: string;
  contractDocumentUrl?: string;
  contractDocumentPublicId?: string;
  notes?: string;
  createdBy: string;
}
