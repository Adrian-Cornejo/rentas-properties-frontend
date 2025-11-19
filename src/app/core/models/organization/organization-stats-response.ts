export interface OrganizationStatsResponse {
  organizationId: string;
  organizationName: string;
  maxUsers: number;
  currentUsersCount: number;
  currentPropertiesCount: number;
  availableProperties: number;
  rentedProperties: number;
  maintenanceProperties: number;
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
}
