export interface serviceType {
  id: number;
  name: string;
  deliveryTime: string;
  status: 'active' | 'inactive';
}

export interface ServiceTypeResponse {
  success: boolean;
  message?: string; 
  serviceType?: serviceType;  
  serviceTypes?: serviceType[];
  shippingFee?: number;
}

export interface ServiceTypeState {
  serviceType: serviceType | null;
  loading: boolean;
  error: string | null;
  serviceTypes?: serviceType[];
  shippingFee?: number | 0;
}