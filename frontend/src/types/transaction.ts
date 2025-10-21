import { User } from "./auth";
import { Office } from "./office";
import { Order } from "./order";

export interface Transaction {
  id: number;
  order?: Order;
  office?: Office;
  user?: User;
  amount: number,
  type: 'Income' | 'Expense';
  method: 'Cash' | 'VNPay',
  purpose: 'Refund' |    
        'CODReturn' |  
        'ShippingService' |
        'OfficeExpense' |
        'RevenueTransfer' 
  confirmedAt: Date,
  notes: string;
  paymentSubmissionId: number;
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  transaction?: Transaction;
  transactions: Transaction[];
  total?: number,
  page?: number,
  limit?: number,
  types?: string[],
  statuses?: string[];
  nextCursor?: number;
}

export interface TransactionState {
  transaction?: Transaction | null;
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  types: string[];
}