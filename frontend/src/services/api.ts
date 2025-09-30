import axios from 'axios';
import { RegisterData, LoginData, VerifyOTPData, AuthResponse, ForgotPasswordData, VerifyResetOTPData, ResetPasswordData } from '../types/auth';
import { Office, OfficeResponse } from '../types/office';
import { Employee, EmployeeCheckResult, EmployeeResponse } from '../types/employee';
import { ServiceTypeResponse } from '../types/serviceType';
import { OrderResponse } from '../types/order';

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

export type VehicleRow = {
  id: number;
  licensePlate: string;
  type: 'Truck' | 'Van';
  capacity: number;
  status: 'Available' | 'InUse' | 'Maintenance';
  description?: string;
  createdAt: string;
  updatedAt: string;
  shipments?: {
    id: number;
    status: string;
    createdAt: string;
  }[];
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

  // Update profile
  updateProfile: async (payload: Partial<{ firstName: string; lastName: string; phoneNumber: string; detailAddress?: string; codeWard?: number; codeCity?: number }>): Promise<AuthResponse> => {
    const response = await api.put<AuthResponse>('/auth/profile', payload);
    return response.data;
  },

  // Update avatar
  updateAvatar: async (file: File): Promise<AuthResponse> => {
    const form = new FormData();
    form.append('avatar', file);
    const response = await api.put<AuthResponse>('/auth/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

  // Get Assignable Roles
  getAssignableRoles: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/roles/assignable');
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

  // Vehicle APIs
  listVehicles: async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }): Promise<Paginated<VehicleRow>> => {
    const response = await api.get<Paginated<VehicleRow>>('/admin/vehicles', { params });
    return response.data;
  },
  getVehicle: async (id: number): Promise<{ success: boolean; data: VehicleRow }> => {
    const response = await api.get<{ success: boolean; data: VehicleRow }>(`/admin/vehicles/${id}`);
    return response.data;
  },
  createVehicle: async (payload: { licensePlate: string; type: 'Truck' | 'Van'; capacity: number; status?: 'Available' | 'InUse' | 'Maintenance'; description?: string }): Promise<{ success: boolean; data: VehicleRow }> => {
    const response = await api.post<{ success: boolean; data: VehicleRow }>(`/admin/vehicles`, payload);
    return response.data;
  },
  updateVehicle: async (id: number, payload: Partial<{ licensePlate: string; type: 'Truck' | 'Van'; capacity: number; status: 'Available' | 'InUse' | 'Maintenance'; description: string }>): Promise<{ success: boolean; data: VehicleRow }> => {
    const response = await api.put<{ success: boolean; data: VehicleRow }>(`/admin/vehicles/${id}`, payload);
    return response.data;
  },
  deleteVehicle: async (id: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/admin/vehicles/${id}`);
    return response.data;
  },
  getVehicleStats: async (): Promise<{ success: boolean; data: { total: number; available: number; inUse: number; maintenance: number } }> => {
    const response = await api.get<{ success: boolean; data: { total: number; available: number; inUse: number; maintenance: number } }>('/admin/vehicles/stats');
    return response.data;
  },
};

export const officeAPI = {
  // Find Office By UserId
  getByUserId: async (userId: number): Promise<OfficeResponse> => {
    const response = await api.get<OfficeResponse>('/me/office', {
      params: { userId }, 
    });
    return response.data;
  },

  // Update Office
  update: async (officeData: Partial<Office>): Promise<OfficeResponse> => {
    if (!officeData.id) throw new Error("Office id không tồn tại");

    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...data } = officeData;

    const response = await api.put<OfficeResponse>(
      `/offices/${id}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  },
};

export const employeeAPI = {
  // Get Shift Enum
  getShiftEnum: async (): Promise<EmployeeResponse> => {
    const response = await api.get<EmployeeResponse>('/employees/shifts');
    return response.data;
  },

  // Get Status Enum
  getStatusEnum: async (): Promise<EmployeeResponse> => {
    const response = await api.get<EmployeeResponse>('/employees/status');
    return response.data;
  },

  getEmployeesByOffice: async (officeId: number, query: string): Promise<EmployeeResponse> => {
    const res = await api.get<EmployeeResponse>(`/employees/by-office/${officeId}?${query}`);
    return res.data; 
  },

  // Check Before Add Employee
  checkBeforeAdd: async (
    email: string,
    phoneNumber: string,
    officeId?: number
  ): Promise<EmployeeCheckResult> => {
      const response = await api.get<EmployeeCheckResult>(
  `/employees/check-before-add`,
    {
      params: { email, phoneNumber, officeId } 
    }
    );
    return response.data;
  },

  // Add Employee
  addEmployee: async (employee: Partial<Employee>): Promise<EmployeeResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = employee;

    try {
      const response = await api.post<EmployeeResponse>(
        `/employees/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi thêm nhân viên');
    }
  },

  // Update Employee
  updateEmployee: async (employee: Partial<Employee>): Promise<EmployeeResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = employee;

    try {
      const response = await api.put<EmployeeResponse>(
        `/employees/update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin nhân viên');
    }
  },

  // Import Employees
  importEmployees: async (employees: Partial<Employee>[]): Promise<EmployeeResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<EmployeeResponse>(
        `/employees/import`, 
        { employees }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi import nhân viên');
    }
  },
};

export const serviceTypeAPI = {
  // Get Active Service Types
  getActiveServiceTypes: async (): Promise<ServiceTypeResponse> => {
    const response = await api.get<ServiceTypeResponse>('/services/get-active');
    return response.data;
  },
}

export const orderAPI = {
  calculateShippingFee: async(weight: number, serviceTypeId: number, senderCodeCity: number, recipientCodeCity: number
  ): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(
      '/orders/calculate-shipping-fee',
      {
        params: { weight, serviceTypeId, senderCodeCity, recipientCodeCity, },
      }
    );
    return response.data;
  },
}

export default api;