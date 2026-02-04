export interface CreateLocationRequest {
  name: string;
  state: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  neighborhoodType?: string;
  zoneType?: string;
  streetAddress?: string;
  description?: string;
}
