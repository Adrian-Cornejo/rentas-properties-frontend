import {OrganizationResponse} from './organization-response';

export interface OrganizationDetailResponse extends OrganizationResponse {
  totalUsers: number;
  totalProperties: number;
  activeContracts: number;
}
