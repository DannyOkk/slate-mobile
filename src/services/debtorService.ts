import { API } from './api';
import { Debtor } from '@/types/debtor';

/**
 * Servicio para consultar el listado de clientes deudores (/api/clients/debtors).
 */
export const debtorService = {
  /**
   * Obtiene la lista de deudores ordenada de mayor a menor saldo adeudado.
   * @param minBalance Monto mínimo de saldo deudor para filtrar (por defecto 0.01).
   */
  async getDebtors(minBalance: number = 0.01): Promise<Debtor[]> {
    const response = await API.get<Debtor[]>('/clients/debtors', {
      params: { minBalance },
    });
    return response.data;
  },
};

export default debtorService;
