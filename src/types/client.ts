export interface Client {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}
