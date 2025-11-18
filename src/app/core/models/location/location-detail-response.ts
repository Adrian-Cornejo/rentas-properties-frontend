import {LocationResponse} from './location-response';

export interface LocationDetailResponse extends LocationResponse {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
}
