export type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export interface Client {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  riskLevel?: RiskLevel;
  totalBalance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

