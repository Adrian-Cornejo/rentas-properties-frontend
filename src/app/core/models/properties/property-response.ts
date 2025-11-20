export interface PropertyResponse {
  id: string;
  propertyCode: string;
  propertyType: 'CASA' | 'DEPARTAMENTO' | 'LOCAL_COMERCIAL';
  address: string;
  monthlyRent: number;
  waterFee: number;
  status: 'DISPONIBLE' | 'RENTADA' | 'MANTENIMIENTO';
  locationId?: string;
  locationName?: string;
  organizationId: string;
  organizationName: string;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  totalAreaM2?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  mainImageUrl?: string;
  imageUrls?: string[];
}
