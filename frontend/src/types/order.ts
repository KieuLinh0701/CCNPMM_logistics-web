import { User } from "./auth";
import { Office } from "./office";
import { promotion } from "./promotion";
import { serviceType } from "./serviceType";

export interface Order {
  id: number;
  trackingNumber: string;

  senderName: string;
  senderPhone: string;
  senderAddress: Address;

  recipientName: string;
  recipientPhone: string;
  recipientAddress: Address;

  weight: number;
  serviceType: serviceType; 
  cod: number;
  orderValue: number;

  payer: 'Customer' |  'Shop';
  paymentMethod: 'Cash' | 'BankTransfer' | 'VNPay' | 'ZaloPay';
  paymentStatus: 'Paid' | 'Unpaid';

  notes: string;

  user: User;

  promotion: promotion | null; 

  discountAmount: number;
  shippingFee: number;

  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

  deliveredAt: Date;

  fromOffice: Office;
  toOffice: Office;
}

export interface Address {
  codeCity: number;
  codeWard: number;
  detailAddress: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string; 
  order?: Order;  
  shippingFee: number, 
}

export interface OrderState {
  order: Order | null;
  loading: boolean;
  error: string | null;
  shippingFee: number | 0; 
}