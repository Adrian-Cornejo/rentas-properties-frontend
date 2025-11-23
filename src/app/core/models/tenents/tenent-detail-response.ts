export interface TenantDetailResponse {
  id: string;
  organizationId: string;
  organizationName: string;
  fullName: string;
  phone: string;
  email?: string;
  ineNumber?: string;
  ineImageUrl?: string;
  inePublicId?: string;
  numberOfOccupants: number;
  notes?: string;
  isActive: boolean;
  activeContractsCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
