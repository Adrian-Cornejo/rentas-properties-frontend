export interface CreateOrganizationRequest {
  name: string;
  subscriptionPlan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  maxUsers: number;
  maxProperties: number;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}
