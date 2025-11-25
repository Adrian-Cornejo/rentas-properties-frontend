export interface AddLateFeeRequest {
  lateFeeAmount: number;
  reason?: string;
  automatic: boolean;
}
