import { User } from "./auth";
import { Office } from "./office";
import { Order } from "./order";

export interface ShippingRequest {
  id: number;
  order: Order;
  office: Office;
  requestType: 'Complaint' | 'DeliveryReminder' | 'ChangeOrderInfo' | 'Inquiry';
  requestContent: string;
  status: 'Pending' | 'Processing' | 'Resolved' | 'Rejected' | 'Cancelled';
  response: string;
  createdAt: Date;
  user?: User;
  contactName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  contactCityCode?: number;
  contactWardCode?: number;
  contactDetailAddress?: string;
}

export interface ShippingRequestResponse {
  success: boolean;
  message?: string;
  request?: ShippingRequest;
  requests: ShippingRequest[];
  total: number;
  page: number;
  limit: number;
  requestTypes: string[];
  statuses: string[];

}

export interface ShippingRequestState {
  request?: ShippingRequest | null;
  loading: boolean;
  error: string | null;
  requests: ShippingRequest[];
  total: number;
  page: number;
  limit: number;
  requestTypes: string[];
  statuses: string[];
}