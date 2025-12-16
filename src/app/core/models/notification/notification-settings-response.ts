export interface NotificationSettingsResponse {
  enabled: boolean;
  channel: 'SMS' | 'WHATSAPP' | 'BOTH';
  adminNotifications: boolean;
  sentThisMonth: number;
  monthlyLimit: number;
  remainingCredits: number;
  subscriptionPlan: 'BASICO' | 'INTERMEDIO' | 'SUPERIOR';
}
