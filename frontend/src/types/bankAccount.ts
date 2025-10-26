import { User } from "./auth";

export interface BankAccount {
    id: number;
    user: User;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
    notes: string;
    createdAt: Date;
}

export interface BankAccountResponse {
    success: boolean;
    message?: string;
    account?: BankAccount;
    accounts?: BankAccount[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface BankAccountState {
    account: BankAccount | null;
    accounts: BankAccount[];
    message: string | null;
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    error: string | null;
}