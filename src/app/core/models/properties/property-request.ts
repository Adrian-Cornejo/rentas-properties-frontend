export interface CreatePropertyRequest {
  locationId?: string;
  propertyCode: string;
  propertyType: 'CASA' | 'DEPARTAMENTO' | 'LOCAL_COMERCIAL';

  // CAMPOS SEPOMEX (obligatorios)
  state: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  neighborhoodType?: string;
  zoneType?: string;
  streetAddress: string;

  monthlyRent: number;
  waterFee?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  halfBathrooms?: number;
  hasLivingRoom?: boolean;
  hasDiningRoom?: boolean;
  hasKitchen?: boolean;
  hasServiceArea?: boolean;
  parkingSpaces?: number;
  totalAreaM2?: number;
  includesWater?: boolean;
  includesElectricity?: boolean;
  includesGas?: boolean;
  includesInternet?: boolean;
  notes?: string;
  imageUrls?: string[];
}
