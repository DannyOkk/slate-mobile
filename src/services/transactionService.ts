import { API } from './api';
import {
  ClientTransactionsSummary,
  CreateTransactionPayload,
  Transaction,
} from '@/types/transaction';

/**
 * Servicio para gestionar transacciones (fiados y pagos) asociadas a un cliente (/api/clients/{clientId}/transactions).
 */
export const transactionService = {
  /**
   * Obtiene el resumen de transacciones y saldo acumulado para un cliente específico.
   */
  async getClientTransactions(clientId: number): Promise<ClientTransactionsSummary> {
    const response = await API.get<ClientTransactionsSummary>(
      `/clients/${clientId}/transactions`
    );
    return response.data;
  },

  /**
   * Registra un nuevo fiado o pago para el cliente.
   */
  async createTransaction(
    clientId: number,
    data: CreateTransactionPayload
  ): Promise<Transaction> {
    const response = await API.post<Transaction>(
      `/clients/${clientId}/transactions`,
      {
        amount: data.amount,
        type: data.type,
        description: data.description?.trim() || undefined,
      }
    );
    return response.data;
  },
};

export default transactionService;
