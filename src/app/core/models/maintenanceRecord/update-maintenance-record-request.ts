export interface UpdateMaintenanceRecordRequest {
  title?: string;
  description?: string;
  maintenanceType?: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA';
  category?: 'PLOMERIA' | 'ELECTRICIDAD' | 'PINTURA' | 'LIMPIEZA' | 'CARPINTERIA' | 'JARDINERIA' | 'AIRE_ACONDICIONADO' | 'OTRO';
  maintenanceDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  status?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  assignedTo?: string;
  notes?: string;
}
