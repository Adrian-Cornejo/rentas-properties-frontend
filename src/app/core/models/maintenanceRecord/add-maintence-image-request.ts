export interface AddMaintenanceImageRequest {
  imageUrl: string;
  imagePublicId: string;
  imageType: 'ANTES' | 'DESPUES' | 'EVIDENCIA';
  description?: string;
}
