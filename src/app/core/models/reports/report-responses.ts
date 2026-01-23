// src/app/core/models/reports/report-responses.ts

// ========================================
// REPORTE FINANCIERO
// ========================================

export interface FinancialReportResponse {
  startDate: string;
  endDate: string;
  summary: FinancialSummary;
  monthlyIncomes: MonthlyIncome[];
  propertyIncomes: PropertyIncome[];
  comparison: PeriodComparison;
}

export interface FinancialSummary {
  totalIncome: number;
  rentIncome: number;
  waterIncome: number;
  maintenanceExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface MonthlyIncome {
  month: string;
  year: number;
  income: number;
  expenses: number;
  netProfit: number;
  paymentsCount: number;
}

export interface PropertyIncome {
  propertyCode: string;
  address: string;
  propertyType: string;
  totalIncome: number;
  maintenanceExpenses: number;
  netProfit: number;
  roi: number;
}

export interface PeriodComparison {
  currentIncome: number;
  previousIncome: number;
  absoluteChange: number;
  percentageChange: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// ========================================
// REPORTE OCUPACIÓN
// ========================================

export interface OccupancyReportResponse {
  startDate: string;
  endDate: string;
  summary: OccupancySummary;
  monthlyOccupancy: MonthlyOccupancy[];
  propertyOccupancy: PropertyOccupancy[];
}

export interface OccupancySummary {
  totalProperties: number;
  rentedProperties: number;
  availableProperties: number;
  maintenanceProperties: number;
  occupancyRate: number;
  averageDaysToRent: number;
  tenantTurnover: number;
}

export interface MonthlyOccupancy {
  month: string;
  year: number;
  rented: number;
  available: number;
  occupancyRate: number;
}

export interface PropertyOccupancy {
  propertyCode: string;
  address: string;
  propertyType: string;
  currentStatus: string;
  daysOccupied: number;
  daysAvailable: number;
  occupancyRate: number;
  contractsCount: number;
}

// ========================================
// REPORTE PAGOS
// ========================================

export interface PaymentReportResponse {
  startDate: string;
  endDate: string;
  summary: PaymentSummary;
  paymentDetails: PaymentDetail[];
  topDelinquents: ContractDelinquency[];
  monthlyDelinquency: MonthlyDelinquency[];
}

export interface PaymentSummary {
  totalPayments: number;
  pendingPayments: number;
  paidPayments: number;
  overduePayments: number;
  totalExpected: number;
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
  delinquencyRate: number;
  averageDaysOverdue: number;
  collectionEfficiency: number;
}

export interface PaymentDetail {
  contractNumber: string;
  propertyCode: string;
  propertyAddress: string;
  tenantName: string;
  periodMonth: number;
  periodYear: number;
  dueDate: string;
  paymentDate: string | null;
  amount: number;
  status: string;
  daysOverdue: number | null;
}

export interface ContractDelinquency {
  contractNumber: string;
  propertyCode: string;
  tenantName: string;
  overdueCount: number;
  overdueAmount: number;
  averageDaysOverdue: number;
}

export interface MonthlyDelinquency {
  month: string;
  year: number;
  overdueCount: number;
  overdueAmount: number;
  delinquencyRate: number;
}

// ========================================
// REPORTE MANTENIMIENTO
// ========================================

export interface MaintenanceReportResponse {
  startDate: string;
  endDate: string;
  summary: MaintenanceSummary;
  typeBreakdown: TypeBreakdown;
  categoryBreakdown: CategoryBreakdown[];
  propertyMaintenances: PropertyMaintenance[];
  costComparison: CostComparison;
}

export interface MaintenanceSummary {
  totalMaintenances: number;
  pending: number;
  inProgress: number;
  completed: number;
  canceled: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  costVariance: number;
  averageFrequency: number;
}

export interface TypeBreakdown {
  preventive: number;
  corrective: number;
  emergency: number;
  preventiveCost: number;
  correctiveCost: number;
  emergencyCost: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  totalCost: number;
  percentage: number;
}

export interface PropertyMaintenance {
  propertyCode: string;
  address: string;
  maintenanceCount: number;
  estimatedCost: number;
  actualCost: number;
  mostFrequentType: string;
  mostFrequentCategory: string;
}

export interface CostComparison {
  totalEstimated: number;
  totalActual: number;
  absoluteDifference: number;
  percentageDifference: number;
  estimationAccuracy: number;
}

// ========================================
// REPORTE EJECUTIVO
// ========================================

export interface ExecutiveReportResponse {
  year: number;
  comparisonYear: number;
  period: string | null;
  kpis: ExecutiveKPIs;
  yearComparison: YearComparison;
  propertyROIs: PropertyROI[];
  locationProfitability: LocationProfitability[];
  propertyPerformance: PropertyPerformance;
}

export interface ExecutiveKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  occupancyRate: number;
  delinquencyRate: number;
  collectionEfficiency: number;
  averageROI: number;
  activeProperties: number;
  activeContracts: number;
}

export interface YearComparison {
  currentYearRevenue: number;
  previousYearRevenue: number;
  revenueGrowth: number;
  currentYearExpenses: number;
  previousYearExpenses: number;
  expensesGrowth: number;
  currentYearProfit: number;
  previousYearProfit: number;
  profitGrowth: number;
  currentYearOccupancy: number;
  previousYearOccupancy: number;
  occupancyChange: number;
}

export interface PropertyROI {
  propertyCode: string;
  address: string;
  propertyType: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  roi: number;
  occupancyRate: number;
}

export interface LocationProfitability {
  locationName: string;
  propertiesCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageROI: number;
  averageOccupancy: number;
}

export interface PropertyPerformance {
  topPerformers: PropertyROI[];
  worstPerformers: PropertyROI[];
  highestOccupancy: PropertyROI[];
  lowestOccupancy: PropertyROI[];
}
