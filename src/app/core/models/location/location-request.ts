export interface CreateLocationRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
