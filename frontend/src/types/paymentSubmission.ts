import { User } from "./auth";
import { Office } from "./office";
import { Order } from "./order";

export interface PaymentSubmission {
  id: number;
  office: Office;
  submittedBy?: User;
  totalAmountSubmitted: number,
  status: 'Pending' | 'Confirmed' | 'Adjusted' | 'Rejected';
  notes: string;
  reconciledAt: Date,
  confirmedBy: User;
  createdAt: Date,
  orderIds: number[];
}

export interface SubmissionSummary {
  status: "Pending" | "Confirmed" | "Adjusted" | "Rejected";
  count: number;
  totalAmount: number | string;
}

export interface PaymentSubmissionSummary {
  totalCOD: number;
  totalOrderValue: number;
  orderCount: number;
}


export interface PaymentSubmissionResponse {
  success: boolean;
  message?: string;
  totalCOD?: number;
  totalOrderValue?: number;
  orderCount?: number;
  paymentSubmission: PaymentSubmission;
  paymentSubmissions: PaymentSubmission[];
  statuses: string[];
  orders: Order[];
  total?: number,
  page?: number,
  limit?: number,
  summary?: SubmissionSummary[];
}

export interface PaymentSubmissionState {
  paymentSubmission: PaymentSubmission | null;
  paymentSubmissions: PaymentSubmission[] | [];
  loading: boolean;
  error: string | null;
  pending: PaymentSubmissionSummary;
  confirmed: PaymentSubmissionSummary;
  statuses: string[] | [];
  total: number;
  page: number;
  limit: number;
  orders: Order[] | [];
  summary: SubmissionSummary[] | [];
}