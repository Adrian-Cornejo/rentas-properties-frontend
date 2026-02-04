import { LocationResponse } from './location-response';

export interface LocationDetailResponse extends LocationResponse {
  organizationId: string;
  organizationName: string;
  totalProperties?: number;
  updatedAt: string;
  createdBy: string;
}
