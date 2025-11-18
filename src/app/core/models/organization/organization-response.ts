export interface OrganizationResponse {
  id: string;
  name: string;
  logoUrl: string;
  subscriptionPlan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  invitationCode: string;
  maxUsers: number;
  maxProperties: number;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
