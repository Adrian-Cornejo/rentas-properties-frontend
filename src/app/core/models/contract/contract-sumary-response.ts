export interface ContractSummaryResponse {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  canceledContracts: number;
  renewedContracts: number;
  contractsExpiringThisMonth: number;
  pendingDepositsCount: number;
  totalDepositsPending: number;
  totalDepositsCollected: number;
}
