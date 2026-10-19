export interface Debtor {
  clientId: number;
  clientName: string;
  clientPhone?: string;
  totalBalance: number;
  lastTransactionDate?: string;
}
