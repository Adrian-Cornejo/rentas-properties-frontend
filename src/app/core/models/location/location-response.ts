export interface LocationResponse {
  id: string;
  name: string;
  state: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  neighborhoodType?: string;
  zoneType?: string;
  streetAddress?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}
