export type TransactionType = 'FIADO' | 'PAGO';

export interface Transaction {
  id: number;
  clientId: number;
  amount: number;
  type: TransactionType;
  description?: string;
  createdAt: string;
}

export interface ClientTransactionsSummary {
  clientId: number;
  clientName: string;
  totalBalance: number;
  transactions: Transaction[];
}

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  description?: string;
}
