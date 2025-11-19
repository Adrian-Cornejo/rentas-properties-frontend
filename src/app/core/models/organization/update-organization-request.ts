export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  logoPublicId?: string;
  codeIsReusable?: boolean;
}
