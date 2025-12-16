// src/app/core/models/plan-features.model.ts

export interface PlanFeatures {
  planCode: string;
  planName: string;
  planDescription: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  metadata: Record<string, string>;
}

export interface PlanLimits {
  maxProperties: number;
  maxUsers: number;
  maxActiveContracts: number;
  imagesPerProperty: number;
  monthlyNotificationLimit: number;
  storageLimitMb: number;
  reportHistoryDays: number;
  currentProperties: number;
  currentUsers: number;
  notificationsSentThisMonth: number;
}

export enum PlanFeature {
  NOTIFICATIONS = 'NOTIFICATIONS',
  MAINTENANCE_PHOTOS = 'MAINTENANCE_PHOTOS',
  ADVANCED_REPORTS = 'ADVANCED_REPORTS',
  PDF_REPORTS = 'PDF_REPORTS',
  DATA_EXPORT = 'DATA_EXPORT',
  ADMIN_DIGEST = 'ADMIN_DIGEST',
  LATE_REMINDERS = 'LATE_REMINDERS',
  WHITE_LABEL = 'WHITE_LABEL',
  API_ACCESS = 'API_ACCESS',
  MULTI_CURRENCY = 'MULTI_CURRENCY',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  E_SIGNATURE = 'E_SIGNATURE',
  TENANT_PORTAL = 'TENANT_PORTAL',
  MOBILE_APP = 'MOBILE_APP',
  INTEGRATIONS = 'INTEGRATIONS',
  MAINTENANCE_SCHEDULING = 'MAINTENANCE_SCHEDULING',
  MULTI_CHANNEL_NOTIFICATIONS = 'MULTI_CHANNEL_NOTIFICATIONS',
  ALLOWS_IMAGES = 'ALLOWS_IMAGES',
  OVERDUE_NOTIFICATIONS = 'OVERDUE_NOTIFICATIONS'
}

export enum PlanCode {
  STARTER = 'STARTER',
  BASICO = 'BASICO',
  PROFESIONAL = 'PROFESIONAL',
  EMPRESARIAL = 'EMPRESARIAL'
}
