export interface NotificationStatsResponse {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  sentThisMonth: number;
  monthlyLimit: number;
  remainingCredits: number;
  deliveryRate: number;
  chartData: ChartData[];
  recentNotifications: RecentNotification[];
}

export interface ChartData {
  date: string; // LocalDate viene como string desde backend
  sent: number;
  delivered: number;
  failed: number;
}

export interface RecentNotification {
  type: string; // PAYMENT_REMINDER, CONTRACT_EXPIRY, MAINTENANCE_ALERT
  channel: string; // SMS, WHATSAPP
  status: string; // PENDING, SENT, FAILED, DELIVERED
  recipientPhone: string;
  sentAt: string; // DateTime como string
}
