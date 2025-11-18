export interface MaintenanceRecordResponse {
  id: string;
  propertyId: string;
  propertyCode: string;
  propertyAddress: string;
  contractId?: string;
  contractNumber?: string;
  title: string;
  maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA';
  category?: string;
  maintenanceDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  assignedTo?: string;
  imageCount: number;
  createdAt: string;
}

export interface PropertyDto {
  id: string;
  propertyCode: string;
  address: string;
  propertyType: string;
}

export interface ContractDto {
  id: string;
  contractNumber: string;
}
