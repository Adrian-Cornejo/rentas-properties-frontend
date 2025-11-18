export interface ContractResponse {
  id: string;
  organizationId: string;
  organizationName: string;
  propertyId: string;
  propertyCode: string;
  propertyAddress: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  waterFee: number;
  depositAmount: number;
  depositPaid: boolean;
  status: 'ACTIVO' | 'VENCIDO' | 'CANCELADO' | 'RENOVADO';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
