import { User } from './auth';
import { Order } from './order';
import { Vehicle } from './vehicle';

export interface Incident {
  id: number;
  order: Order;
  shipper: User;
  incidentType: 
    | 'recipient_not_available'
    | 'wrong_address'
    | 'package_damaged'
    | 'recipient_refused'
    | 'security_issue'
    | 'other';
  title: string;
  description: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  recipientName?: string;
  recipientPhone?: string;
  images?: string[];
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  resolution?: string;
  handledBy?: User;
  handledAt?: Date;
  createdAt: string;
}

export interface Summary {
  key: string;
  value: number;
}

export interface IncidentReportResponse {
  success: boolean;
  message?: string;
  incidents?: Incident[];
  total?: number;
  page?: number;
  limit?: number;
  statuses?: string[];
  types?: string[];
  totalByStatus?: Summary[];
}

export interface IncidentReportState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  statuses: string[] | [];
  types: string[] | [];
  totalByStatus: Summary[] | [];
}