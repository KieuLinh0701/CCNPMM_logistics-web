import { User } from "./auth";
import { Office } from "./office";
import { Order } from "./order";

export interface TransactionImage {
  id: number;
  transaction: Transaction;
  url: string;
  createdAd: Date;
}

export interface Transaction {
  id: number;
  title: string;
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
  createdAt: Date,
  notes: string;
  paymentSubmissionId: number;
  images: TransactionImage[];
  status: 'Pending' | 'Confirmed' | "Rejected"
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
  totalIncome: number;
  totalExpense: number,
  balance: number,
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
  statuses: string[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}