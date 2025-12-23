export interface PropertyResponse {
  id: string;
  propertyCode: string;
  propertyType: string;
  address: string;
  monthlyRent: number;
  waterFee: number;
  status: string;
  locationId?: string;
  location: Location;
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

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}
