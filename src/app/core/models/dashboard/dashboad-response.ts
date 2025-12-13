export interface DashboardResponse {
  generalStats: GeneralStats;
  propertiesStats: PropertiesStats;
  contractsStats: ContractsStats;
  paymentsStats: PaymentsStats;
  maintenanceStats: MaintenanceStats;
  recentActivity: RecentActivity;
  chartsData: ChartsData;
}

export interface GeneralStats {
  totalProperties: number;
  totalTenants: number;
  activeContracts: number;
  totalOccupants: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export interface PropertiesStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  occupancyRate: number;
}

export interface ContractsStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  renewed: number;
  canceled: number;
  pendingDeposits: number;
  pendingDepositsCount: number;
}

export interface PaymentsStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  dueToday: number;
  dueThisWeek: number;
}

export interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  estimatedCosts: number;
  actualCosts: number;
}

export interface RecentActivity {
  propertyAlerts: PropertyAlert[];
  contractAlerts: ContractAlert[];
  paymentAlerts: PaymentAlert[];
  topPropertiesByRevenue: TopProperty[];
  topPropertiesByOverduePayments: TopProperty[];
}

export interface PropertyAlert {
  propertyCode: string;
  address: string;
  alertType: string;
  message: string;
  daysCount?: number;
}

export interface ContractAlert {
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
  alertType: string;
  message: string;
  daysUntilExpiry?: number;
}

export interface PaymentAlert {
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
  alertType: string;
  amount: number;
  daysOverdue?: number;
}

export interface TopProperty {
  propertyCode: string;
  address: string;
  amount: number;
  count: number;
}

export interface ChartsData {
  monthlyRevenue: MonthlyRevenueChart;
  paymentStatus: PaymentStatusChart;
  propertyStatus: PropertyStatusChart;
  contractStatus: ContractStatusChart;
  maintenanceTypes: MaintenanceTypeChart;
}

export interface MonthlyRevenueChart {
  months: string[];
  revenue: number[];
  paymentsCount: number[];
}

export interface PaymentStatusChart {
  paid: number;
  pending: number;
  overdue: number;
}

export interface PropertyStatusChart {
  available: number;
  rented: number;
  maintenance: number;
}

export interface ContractStatusChart {
  active: number;
  expired: number;
  expiringSoon: number;
  renewed: number;
  canceled: number;
}

export interface MaintenanceTypeChart {
  preventivo: number;
  correctivo: number;
  emergencia: number;
}
