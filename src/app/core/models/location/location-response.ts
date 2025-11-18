export interface LocationResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  organizationId: string;
  organizationName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
