export interface OrganizationInfoResponse {
  id: string;
  name: string;
  logoUrl: string;
  subscriptionPlan: 'BASICO' | 'INTERMEDIO' | 'SUPERIOR';
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  maxProperties: number;
  currentPropertiesCount: number;
  maxUsers: number;
  currentUsersCount: number;
  primaryColor: string;
  secondaryColor: string;
}
