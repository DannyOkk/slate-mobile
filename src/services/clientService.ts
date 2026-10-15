import { API } from './api';
import { Client, ClientFormData } from '@/types/client';

/**
 * Servicio para la gestión de clientes en el backend Spring Boot (/api/clients).
 */
export const clientService = {
  /**
   * Obtiene la lista completa de clientes del comerciante autenticado.
   */
  async getClients(): Promise<Client[]> {
    const response = await API.get<Client[]>('/clients');
    return response.data;
  },

  /**
   * Obtiene los datos detallados de un cliente por su ID.
   */
  async getClientById(id: number): Promise<Client> {
    const response = await API.get<Client>(`/clients/${id}`);
    return response.data;
  },

  /**
   * Registra un nuevo cliente para el comerciante.
   */
  async createClient(data: ClientFormData): Promise<Client> {
    const response = await API.post<Client>('/clients', {
      name: data.name.trim(),
      phone: data.phone.trim() || undefined,
      address: data.address.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
    return response.data;
  },

  /**
   * Actualiza los datos de un cliente existente.
   */
  async updateClient(id: number, data: ClientFormData): Promise<Client> {
    const response = await API.put<Client>(`/clients/${id}`, {
      name: data.name.trim(),
      phone: data.phone.trim() || undefined,
      address: data.address.trim() || undefined,
      notes: data.notes.trim() || undefined,
    });
    return response.data;
  },

  /**
   * Elimina un cliente por su identificador.
   */
  async deleteClient(id: number): Promise<void> {
    await API.delete(`/clients/${id}`);
  },
};

export default clientService;
