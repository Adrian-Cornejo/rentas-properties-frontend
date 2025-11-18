import {PropertyResponse} from './property-response';

export interface PropertyDetailResponse extends PropertyResponse {
  halfBathrooms?: number;
  hasLivingRoom: boolean;
  hasDiningRoom: boolean;
  hasKitchen: boolean;
  hasServiceArea: boolean;
  parkingSpaces?: number;
  includesWater: boolean;
  includesElectricity: boolean;
  includesGas: boolean;
  includesInternet: boolean;
  notes?: string;
  activeContractId?: string;
  currentTenants?: TenantBasicInfo[];
}
export interface TenantBasicInfo {
  id: string;
  fullName: string;
  phone: string;
}
