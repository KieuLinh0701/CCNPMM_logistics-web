import axios from 'axios';
import { RegisterData, LoginData, VerifyOTPData, AuthResponse, ForgotPasswordData, VerifyResetOTPData, ResetPasswordData } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8088/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type UserRow = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'manager' | 'staff' | 'driver';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = { data: T[]; pagination: { page: number; limit: number; total: number }; success: boolean };
export type PostOfficeRow = {
  id: number;
  code: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  codeWard: number;
  codeCity: number;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  type: 'Head Office' | 'Post Office';
  status: 'Active' | 'Inactive' | 'Maintenance';
  createdAt: string;
  updatedAt: string;
};

export type ServiceTypeRow = {
  id: number;
  name: string;
  deliveryTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderRow = {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  basePrice: number;
  codAmount: number;
  codFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  postOffice: {
    id: number;
    name: string;
    area: string;
  };
  serviceType: {
    id: number;
    name: string;
    deliveryTime: string;
  };
};

export const authAPI = {
  // Register user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get profile
  getProfile: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/profile');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/password/forgot', data);
    return response.data;
  },

  // Verify reset otp
  verifyResetOTP: async (data: VerifyResetOTPData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/password/verify-otp', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/password/reset', data);
    return response.data;
  },
};

export const adminAPI = {
  listUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paginated<UserRow>> => {
    const response = await api.get<Paginated<UserRow>>('/admin/users', { params });
    return response.data;
  },
  getUser: async (id: number): Promise<{ success: boolean; data: UserRow }> => {
    const response = await api.get<{ success: boolean; data: UserRow }>(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (payload: { email: string; password: string; firstName: string; lastName: string; phoneNumber: string; role: UserRow['role']; isActive?: boolean }): Promise<{ success: boolean; data: UserRow }> => {
    const response = await api.post<{ success: boolean; data: UserRow }>(`/admin/users`, payload);
    return response.data;
  },
  updateUser: async (id: number, payload: Partial<{ password: string; firstName: string; lastName: string; phoneNumber: string; role: UserRow['role']; isActive: boolean }>): Promise<{ success: boolean; data: UserRow }> => {
    const response = await api.put<{ success: boolean; data: UserRow }>(`/admin/users/${id}`, payload);
    return response.data;
  },
  deleteUser: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/admin/users/${id}`);
    return response.data;
  },

  // PostOffice APIs
  listPostOffices: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paginated<PostOfficeRow>> => {
    const response = await api.get<Paginated<PostOfficeRow>>('/admin/offices', { params });
    return response.data;
  },
  getPostOffice: async (id: number): Promise<{ success: boolean; data: PostOfficeRow }> => {
    const response = await api.get<{ success: boolean; data: PostOfficeRow }>(`/admin/offices/${id}`);
    return response.data;
  },
  createPostOffice: async (payload: { code: string; name: string; address: string; phoneNumber: string; email: string; codeWard: number; codeCity: number; latitude: number; longitude: number; openingTime: string; closingTime: string; type?: 'Head Office' | 'Post Office'; status?: 'Active' | 'Inactive' | 'Maintenance' }): Promise<{ success: boolean; data: PostOfficeRow }> => {
    const response = await api.post<{ success: boolean; data: PostOfficeRow }>(`/admin/offices`, payload);
    return response.data;
  },
  updatePostOffice: async (id: number, payload: Partial<{ code: string; name: string; address: string; phoneNumber: string; email: string; codeWard: number; codeCity: number; latitude: number; longitude: number; openingTime: string; closingTime: string; type: 'Head Office' | 'Post Office'; status: 'Active' | 'Inactive' | 'Maintenance' }>): Promise<{ success: boolean; data: PostOfficeRow }> => {
    const response = await api.put<{ success: boolean; data: PostOfficeRow }>(`/admin/offices/${id}`, payload);
    return response.data;
  },
  deletePostOffice: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/admin/offices/${id}`);
    return response.data;
  },

  // ServiceType APIs
  listServiceTypes: async (params?: { page?: number; limit?: number; search?: string }): Promise<Paginated<ServiceTypeRow>> => {
    const response = await api.get<Paginated<ServiceTypeRow>>('/admin/servicetypes', { params });
    return response.data;
  },
  getServiceType: async (id: number): Promise<{ success: boolean; data: ServiceTypeRow }> => {
    const response = await api.get<{ success: boolean; data: ServiceTypeRow }>(`/admin/servicetypes/${id}`);
    return response.data;
  },
  createServiceType: async (payload: { name: string; deliveryTime?: string; status?: string }): Promise<{ success: boolean; data: ServiceTypeRow }> => {
    const response = await api.post<{ success: boolean; data: ServiceTypeRow }>(`/admin/servicetypes`, payload);
    return response.data;
  },
  updateServiceType: async (id: number, payload: Partial<{ name: string; deliveryTime?: string; status?: string }>): Promise<{ success: boolean; data: ServiceTypeRow }> => {
    const response = await api.put<{ success: boolean; data: ServiceTypeRow }>(`/admin/servicetypes/${id}`, payload);
    return response.data;
  },
  deleteServiceType: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/admin/servicetypes/${id}`);
    return response.data;
  },

  // Order APIs
  listOrders: async (params?: { page?: number; limit?: number; search?: string; status?: string; postOfficeId?: string }): Promise<Paginated<OrderRow>> => {
    const response = await api.get<Paginated<OrderRow>>('/admin/orders', { params });
    return response.data;
  },
  getOrder: async (id: number): Promise<{ success: boolean; data: OrderRow }> => {
    const response = await api.get<{ success: boolean; data: OrderRow }>(`/admin/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id: number, status: string): Promise<{ success: boolean; data: OrderRow }> => {
    const response = await api.put<{ success: boolean; data: OrderRow }>(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  deleteOrder: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/admin/orders/${id}`);
    return response.data;
  },
};

export default api;