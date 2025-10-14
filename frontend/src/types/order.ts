import { User } from "./auth";
import { Office } from "./office";
import { OrderProduct } from "./orderProduct";
import { Promotion } from "./promotion";
import { serviceType } from "./serviceType";

export interface Order {
  id: number;
  trackingNumber: string;

  senderName: string;
  senderPhone: string;
  senderCityCode: number;
  senderWardCode: number;
  senderDetailAddress: string;

  recipientName: string;
  recipientPhone: string;
  recipientCityCode: number;
  recipientWardCode: number;
  recipientDetailAddress: string;

  weight: number;
  serviceType: serviceType; 
  cod: number;
  orderValue: number;

  payer: 'Customer' |  'Shop';
  paymentMethod: 'Cash' | 'BankTransfer' | 'VNPay' | 'ZaloPay';
  paymentStatus: 'Paid' | 'Unpaid'  | 'Refunded';

  notes: string;

  user?: User | null;

  promotion?: Promotion | null; 

  discountAmount: number;
  shippingFee: number;
  totalFee: number;

  status: 'draft' | 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

  deliveredAt?: Date;

  fromOffice: Office;
  toOffice?: Office;

  orderProducts?: OrderProduct[];
  createdAt?: Date;

  createdBy: User;
  createdByType: 'user' | 'manager';
}

export interface OrderResponse {
  success: boolean;
  message?: string; 
  order?: Order;
  orders: Order[];  
  shippingFee: number, 
  total?: number,
  page?: number,
  limit?: number,
  statuses?: string[];
  paymentMethods?: string[];
  payers?: string[];
  paymentStatuses?: string[];
  paymentUrl?: string;
}

export interface OrderState {
  order: Order | null;
  orders: Order[];
  statuses: string[];
  paymentMethods: string[];
  loading: boolean;
  error: string | null;
  shippingFee: number | 0; 
  total: number;
  page: number;
  limit: number;
  payers: string[];
  paymentStatuses: string[];
  paymentUrl: string | null;
}