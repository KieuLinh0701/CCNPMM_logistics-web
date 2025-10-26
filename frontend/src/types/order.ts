import { User } from "./auth";
import { Office } from "./office";
import { OrderHistory } from "./orderHistory";
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

  payer: 'Customer' | 'Shop';
  paymentMethod: 'Cash' | 'BankTransfer' | 'VNPay' | 'ZaloPay';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';

  notes: string;

  user?: User | null;

  promotion?: Promotion | null;

  discountAmount: number;
  shippingFee: number;
  totalFee: number;

  status: 'draft' | 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivering' | 'delivered' | 'cancelled' | 'returning' | 'returned';

  deliveredAt?: Date;

  fromOffice: Office;
  toOffice?: Office;

  orderProducts?: OrderProduct[];
  createdAt?: Date;

  createdBy: User;
  createdByType: 'user' | 'manager';

  refundedAt?: Date;
  paidAt?: Date;
  histories: OrderHistory[];
}

export interface DashboardSummary {
  totalOrders: number;
  completedOrders: number;
  returnedOrders: number;
  inTransitOrders: number;
  totalWeight: number;
}

export interface StatusChartItem {
  label: string;
  value: number;
}

export interface OrdersByDateItem {
  date: Date;
  count: number;
}

export interface OrderByDateItem {
  date: Date;
  displayDate: string;
  count: number;
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
  summary: DashboardSummary;
  statusChart: StatusChartItem[];
  ordersByDate: OrdersByDateItem[];
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
  summary: DashboardSummary | null;
  statusChart: StatusChartItem[];
  ordersByDate: OrdersByDateItem[];
}