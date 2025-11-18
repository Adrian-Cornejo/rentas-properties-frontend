export interface UpdatePropertyRequest {
  locationId?: string;
  propertyType?: 'CASA' | 'DEPARTAMENTO' | 'LOCAL_COMERCIAL';
  address?: string;
  monthlyRent?: number;
  waterFee?: number;
  status?: 'DISPONIBLE' | 'RENTADA' | 'MANTENIMIENTO';
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
}
