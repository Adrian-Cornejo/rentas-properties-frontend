export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  maxUsers?: number;
  maxProperties?: number;
}
