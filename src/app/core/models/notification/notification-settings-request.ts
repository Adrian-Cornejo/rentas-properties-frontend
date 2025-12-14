export interface NotificationSettingsRequest {
  enabled: boolean;
  channel: 'SMS' | 'WHATSAPP' | 'BOTH';
  adminNotifications: boolean;
}
