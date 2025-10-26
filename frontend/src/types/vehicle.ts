import { Office } from "./office";

export interface Vehicle {
  id?: number;
  licensePlate?: string;
  type: 'Truck' | 'Van';
  capacity: number;
  status: 'Available' | 'InUse' | 'Maintenance' | 'Archived';
  description: string;
  office: Office;
  createdAt: Date;
}

export interface VehicleStatusCount {
  status: string;
  total: number;
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  vehicle?: Vehicle;
  vehicles: Vehicle[];
  total?: number,
  page?: number,
  limit?: number,
  statuses: string[];
  types: string[];
  statusCounts: VehicleStatusCount[];
}

export interface ImportVehicleResult {
  licensePlate: string;
  success: boolean;
  message: string;
  vehicle?: Vehicle;
}

export interface ImportVehiclesResponse {
  success: boolean;
  message: string;
  totalImported: number;
  totalFailed: number;
  results: ImportVehicleResult[];
}

export interface VehicleState {
  vehicle: Vehicle | null;
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null
  total: number;
  page: number;
  limit: number;
  statuses: string[];
  types: string[];
  importResults: ImportVehicleResult[] | null;
  totalImported: number;
  totalFailed: number;
  statusCounts: VehicleStatusCount[] | [];
}