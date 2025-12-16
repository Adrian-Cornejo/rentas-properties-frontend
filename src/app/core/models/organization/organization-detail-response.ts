export interface OrganizationDetailResponse {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  logoPublicId?: string;
  primaryColor: string;
  secondaryColor: string;
  invitationCode: string;
  codeIsReusable: boolean;
  owner?: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  };
  maxUsers: number;
  maxProperties: number;
  currentUsersCount: number;
  currentPropertiesCount: number;
  subscriptionId: string;
  subscriptionStatus: string;
  subscriptionPlan: string;
  trialEndsAt?: string;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
