import { Vehicle } from "./vehicle";

export interface Shipment {
  id: number;
  vehicle: Vehicle;
  status: 'Pending' | 'InTransit' | 'Completed' | 'Cancelled';
  startTime: Date;
  endTime: Date;
  orderCount: number;
  totalWeight: number;
}

export interface ShipmentResponse {
  success: boolean;
  message?: string;
  shipment?: Shipment;
  shipments: Shipment[];
  total?: number,
  page?: number,
  limit?: number,
  statuses?: string[];
}

export interface ShipmentState {
  shipment?: Shipment | null;
  loading: boolean;
  error: string | null;
  shipments: Shipment[];
  total: number;
  page: number;
  limit: number;
  statuses: string[];
}