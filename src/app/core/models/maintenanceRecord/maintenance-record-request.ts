export interface CreateMaintenanceRecordRequest {
  propertyId: string;
  contractId?: string;
  title: string;
  description: string;
  maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA';
  category?: 'PLOMERIA' | 'ELECTRICIDAD' | 'PINTURA' | 'LIMPIEZA' | 'CARPINTERIA' | 'JARDINERIA' | 'AIRE_ACONDICIONADO' | 'OTRO';
  maintenanceDate: string;
  estimatedCost?: number;
  assignedTo?: string;
  notes?: string;
}
