export interface SendTestNotificationRequest {
  phoneNumber: string;
  channel: 'SMS' | 'WHATSAPP';
}
