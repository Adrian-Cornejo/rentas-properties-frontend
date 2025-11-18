import {UserResponse} from '../auth/auth-response.model';

export interface UserDetailResponse extends UserResponse {
  organizationDetails?: {
    id: string;
    name: string;
    subscriptionPlan: string;
    active: boolean;
  };
}
