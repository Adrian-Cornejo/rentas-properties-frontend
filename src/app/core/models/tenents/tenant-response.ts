export interface TenantResponse {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  ineNumber?: string;
  ineImageUrl?: string;
  numberOfOccupants: number;
  organizationId: string;
  organizationName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
