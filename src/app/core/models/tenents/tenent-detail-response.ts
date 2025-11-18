import {TenantResponse} from './tenant-response';

export interface TenantDetailResponse extends TenantResponse {
  inePublicId?: string;
  notes?: string;
  activeContracts: ContractBasicInfo[];
  contractHistory: ContractBasicInfo[];
}

export interface ContractBasicInfo {
  id: string;
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
  startDate: string;
  endDate: string;
  status: string;
}
