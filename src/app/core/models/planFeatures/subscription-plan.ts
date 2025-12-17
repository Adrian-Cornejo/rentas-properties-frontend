export interface SubscriptionPlan {
  id: string;
  planCode: string;
  planName: string;
  planDescription: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  trialDays: number;
  maxProperties: number;
  maxUsers: number;
  maxActiveContracts: number;
  storageLimitMb: number;
  imagesPerProperty: number;
  reportHistoryDays: number;
  hasNotifications: boolean;
  notificationChannels: string | null;
  monthlyNotificationLimit: number;
  hasLateReminders: boolean;
  hasAdminDigest: boolean;
  hasMaintenanceScheduling: boolean;
  hasMaintenancePhotos: boolean;
  hasAdvancedReports: boolean;
  hasDataExport: boolean;
  hasPdfReports: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  hasMultiCurrency: boolean;
  hasDocumentManagement: boolean;
  hasESignature: boolean;
  hasTenantPortal: boolean;
  hasMobileApp: boolean;
  hasIntegrations: boolean;
  supportLevel: string;
  supportResponseHours: number;
  hasOnboarding: boolean;
  hasAccountManager: boolean;
  displayOrder: number;
  isPopular: boolean;
  isCustom: boolean;
  unlimitedUsers: boolean;
  unlimitedNotifications: boolean;
  unlimitedHistory: boolean;
  allowsImages: boolean;
  annualSavingsPercentage?: number;
}

export interface PlanWithUsage extends SubscriptionPlan {
  whiteLabelLevel?: string;
  currentProperties: number;
  currentUsers: number;
  notificationsSentThisMonth: number;
}
