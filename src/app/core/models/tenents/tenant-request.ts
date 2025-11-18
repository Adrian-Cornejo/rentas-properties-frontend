export interface CreateTenantRequest {
  fullName: string;
  phone: string;
  email?: string;
  ineNumber?: string;
  ineImageUrl?: string;
  inePublicId?: string;
  numberOfOccupants?: number;
  notes?: string;
}
