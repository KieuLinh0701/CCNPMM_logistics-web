export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'staff' | 'shipper' | 'driver' | 'user';
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  images?: string;
  detailAddress?: string;
  codeWard?: number;
  codeCity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: 'admin' | 'manager' | 'staff' | 'shipper' | 'driver' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: 'admin' | 'manager' | 'staff' | 'shipper' | 'driver' | 'user';
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyResetOTPData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  roles?: string[];
}

export interface AuthState {
  roles: string[] | null;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

