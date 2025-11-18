import {ContractDto, MaintenanceRecordResponse, PropertyDto} from './maintenance-record-response';

export interface MaintenanceImageDto {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  imageType: 'ANTES' | 'DESPUES' | 'EVIDENCIA';
  description?: string;
  uploadedAt: string;
}

export interface MaintenanceRecordDetailResponse extends MaintenanceRecordResponse {
  property: PropertyDto;
  contract?: ContractDto;
  description: string;
  notes?: string;
  images: MaintenanceImageDto[];
  createdBy: string;
  updatedAt: string;
}

export interface MaintenanceRecordSummaryResponse {
  totalRecords: number;
  pendingRecords: number;
  inProcessRecords: number;
  completedRecords: number;
  canceledRecords: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  averageCostDifference: number;
  recordsByType: {
    preventivo: number;
    correctivo: number;
    emergencia: number;
  };
  recordsByCategory: {
    [key: string]: number;
  };
  completionRate: number;
}
