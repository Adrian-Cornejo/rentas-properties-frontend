export interface TenantResponse {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  numberOfOccupants: number;
  hasINE: boolean;
  isActive: boolean;
  activeContractsCount: number;
  createdAt: string;
}
