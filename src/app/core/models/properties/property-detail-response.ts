import {PropertyResponse} from './property-response';

export interface PropertyDetailResponse extends PropertyResponse {
  // CAMPOS SEPOMEX (agregados desde PropertyResponse base)
  state: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  neighborhoodType?: string;
  zoneType?: string;
  streetAddress: string;

  // CARACTERÍSTICAS FÍSICAS ADICIONALES
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
  imageUrls?: string[];
}
export interface TenantBasicInfo {
  id: string;
  fullName: string;
  phone: string;
}
