export interface PaymentSummaryResponse {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  partialPayments: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  collectedThisMonth: number;
  averagePaymentAmount: number;
}
