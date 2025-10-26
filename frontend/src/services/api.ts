import axios from 'axios';
import { RegisterData, LoginData, VerifyOTPData, AuthResponse, ForgotPasswordData, VerifyResetOTPData, ResetPasswordData } from '../types/auth';
import { Office, OfficeResponse } from '../types/office';
import { Employee, EmployeeCheckResult, EmployeeResponse } from '../types/employee';
import { ServiceTypeResponse } from '../types/serviceType';
import { Order, OrderResponse } from '../types/order';
import { ImportProductsResponse, product, ProductAnalyticsReponse, ProductResponse } from '../types/product';
import { PromotionResponse } from '../types/promotion';
import { ImportVehiclesResponse, Vehicle, VehicleResponse } from '../types/vehicle';
import { ShippingRequest, ShippingRequestResponse } from '../types/shippingRequest';
import { TransactionResponse } from '../types/transaction';
import { PaymentSubmissionResponse } from '../types/paymentSubmission';
import { OrderHistoryResponse } from '../types/orderHistory';
import { ShipmentResponse } from '../types/shipment';
import { BankAccount, BankAccountResponse } from '../types/bankAccount';
import { IncidentReportResponse } from '../types/incidentReport';

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
  officeId?: number;
  office?: {
    id: number;
    name: string;
    address: string;
  };
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
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
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
  createVehicle: async (payload: { licensePlate: string; type: 'Truck' | 'Van'; capacity: number; status?: 'Available' | 'InUse' | 'Maintenance'; description?: string; officeId?: number }): Promise<{ success: boolean; data: VehicleRow }> => {
    const response = await api.post<{ success: boolean; data: VehicleRow }>(`/admin/vehicles`, payload);
    return response.data;
  },
  updateVehicle: async (id: number, payload: Partial<{ licensePlate: string; type: 'Truck' | 'Van'; capacity: number; status: 'Available' | 'InUse' | 'Maintenance'; description: string; officeId: number }>): Promise<{ success: boolean; data: VehicleRow }> => {
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
  // Promotion APIs
  getActivePromotions: async (): Promise<{ success: boolean; data: { promotions: any[]; pagination: any } }> => {
    const response = await api.get<{ success: boolean; data: { promotions: any[]; pagination: any } }>('/admin/promotions?status=active&limit=100');
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

  getOfficesByArea: async (query: string): Promise<OfficeResponse> => {
    const res = await api.get<OfficeResponse>(`/offices?${query}`);
    return res.data;
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
        `/employees/${id}`,
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

  exportEmployeePerformance: async (query: string): Promise<EmployeeResponse> => {
    const res = await api.get<EmployeeResponse>(`/employees/perform-export?${query}`);
    return res.data;
  },

  getEmployeePerformance: async (query: string): Promise<EmployeeResponse> => {
    const res = await api.get<EmployeeResponse>(`/employees/perform?${query}`);
    return res.data;
  },
};

export const serviceTypeAPI = {
  // Get Active Service Types
  getActiveServiceTypes: async (): Promise<ServiceTypeResponse> => {
    const response = await api.get<ServiceTypeResponse>('/services/get-active');
    return response.data;
  },
}

export const productAPI = {
  // Get Statuses Enum
  getProductStatuses: async (): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>('/protected/products/statuses');
    return response.data;
  },

  // Get Types Enum
  getProductTypes: async (): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>('/protected/products/types');
    return response.data;
  },

  listUserProducts: async (query: string): Promise<ProductResponse> => {
    const res = await api.get<ProductResponse>(`/user/products?${query}`);
    return res.data;
  },

  createProduct: async (product: Partial<product>): Promise<ProductResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = product;

    try {
      const response = await api.post<ProductResponse>(
        `/user/products/add`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi thêm sản phẩm');
    }
  },

  // Update Product
  updateProduct: async (product: Partial<product>): Promise<ProductResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = product;

    try {
      const response = await api.put<ProductResponse>(
        `/user/products/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin sản ph');
    }
  },

  // Import Products
  importProducts: async (products: Partial<product>[]): Promise<ImportProductsResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<ImportProductsResponse>(
        `/user/products/import`,
        { products },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi import sản phẩm');
    }
  },

  listActiveUserProducts: async (query: string): Promise<ProductResponse> => {
    const res = await api.get<ProductResponse>(`/user/products/get-active?${query}`);
    return res.data;
  },

  getUserProductsDashboard: async (query: string): Promise<ProductAnalyticsReponse> => {
    const res = await api.get<ProductAnalyticsReponse>(`/user/products/dashboard?${query}`);
    return res.data;
  },
}

export const orderAPI = {
  calculateShippingFee: async (weight: number, serviceTypeId: number, senderCodeCity: number, recipientCodeCity: number
  ): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(
      '/public/orders/calculate-shipping-fee',
      {
        params: { weight, serviceTypeId, senderCodeCity, recipientCodeCity, },
      }
    );
    return response.data;
  },

  // Get Statuses Enum
  getOrderStatuses: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/protected/orders/statuses');
    return response.data;
  },

  // Get Payment Methods Enum
  getOrderPaymentMethods: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/protected/orders/payment-methods');
    return response.data;
  },

  // Get Payers Enum
  getOrderPayers: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/protected/orders/payers');
    return response.data;
  },

  // Get Payment Statuses Enum
  getOrderPaymentStatuses: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/protected/orders/payment-statuses');
    return response.data;
  },

  getOrderByTrackingNumber: async (trackingNumber: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/protected/orders/${trackingNumber}`);
    return res.data;
  },

  getUserOrders: async (query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/user/orders?${query}`);
    return res.data;
  },

  // Create new order
  createUserOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<OrderResponse>(
        '/user/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  },

  cancelUserOrder: async (orderId: number): Promise<OrderResponse> => {
    const res = await api.put<OrderResponse>(`/user/orders/cancel`, { orderId });
    return res.data;
  },

  updateUserOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        '/user/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng');
    }
  },

  setOrderToPending: async (orderId: number): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        '/user/orders/pending',
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng thành đang xử lý');
    }
  },

  getUserOrdersDashboard: async (query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/user/orders/dashboard?${query}`);
    return res.data;
  },

  getOrdersByOfficeId: async (officeId: number, query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/manager/orders/${officeId}?${query}`);
    return res.data;
  },

  cancelManagerOrder: async (orderId: number): Promise<OrderResponse> => {
    const res = await api.put<OrderResponse>(`/manager/orders/cancel`, { orderId });
    return res.data;
  },

  confirmAndAssignOrder: async (orderId: number, officeId: number): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        `/manager/orders/confirm`,
        { orderId, officeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xác nhận đơn hàng');
    }
  },

  // Create new order
  createManagerOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<OrderResponse>(
        '/manager/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  },

  updateManagerOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        '/manager/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng của manager');
    }
  },

  createVNPayURL: async (orderId: number): Promise<{ paymentUrl: string }> => {
    const res = await api.post<{ paymentUrl: string }>(`/payment/create-url`, { orderId });
    return res.data;
  },

  // Check trạng thái thanh toán VNPay
  checkVNPayPayment: async (query: string): Promise<any> => {
    const res = await api.get<any>(`/payment/check-vnpay${query}`);
    return res.data;
  },

  getShipmentOrders: async (shipmentId: number, query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/manager/orders/shipment/${shipmentId}?${query}`);
    return res.data;
  },

  getManagerOrdersDashboard: async (query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/manager/orders/dashboard?${query}`);
    return res.data;
  },
}

export const promotionAPI = {

  getActivePromotions: async (query: string): Promise<PromotionResponse> => {
    const res = await api.get<PromotionResponse>(`/promotions/get-active?${query}`);
    return res.data;
  },
}

export const vehicleAPI = {
  // Get Statuses Enum
  getStatusesEnum: async (): Promise<VehicleResponse> => {
    const response = await api.get<VehicleResponse>('/vehicles/statuses');
    return response.data;
  },

  // Get Types Enum
  getTypesEnum: async (): Promise<VehicleResponse> => {
    const response = await api.get<VehicleResponse>('/vehicles/types');
    return response.data;
  },

  getVehiclesByOffice: async (officeId: number, query: string): Promise<VehicleResponse> => {
    const res = await api.get<VehicleResponse>(`/vehicles/by-office/${officeId}?${query}`);
    return res.data;
  },

  addVehicle: async (officeId: number, vehicle: Partial<Vehicle>): Promise<VehicleResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = vehicle;

    try {
      const response = await api.post<VehicleResponse>(
        `/vehicles/add/${officeId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi thêm phương tiện');
    }
  },

  // Update Vehicle
  updateVehicle: async (vehicle: Partial<Vehicle>): Promise<VehicleResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = vehicle;

    try {
      const response = await api.put<VehicleResponse>(
        `/vehicles/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin phương tiện');
    }
  },

  // Import Vehicles
  importVehicles: async (officeId: number, vehicles: Partial<Vehicle>[]): Promise<ImportVehiclesResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<ImportVehiclesResponse>(
        `/vehicles/import/${officeId}`,
        { vehicles },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response.data.message || 'Lỗi khi import phương tiện');
    }
  },
}

export const requestAPI = {
  // Get Statuses Enum
  getRequestStatuses: async (): Promise<ShippingRequestResponse> => {
    const response = await api.get<ShippingRequestResponse>('/protected/requests/statuses');
    return response.data;
  },

  // Get Types Enum
  getRequestTypes: async (): Promise<ShippingRequestResponse> => {
    const response = await api.get<ShippingRequestResponse>('/protected/requests/types');
    return response.data;
  },

  listUserRequests: async (query: string): Promise<ShippingRequestResponse> => {
    const res = await api.get<ShippingRequestResponse>(`/user/requests?${query}`);
    return res.data;
  },

  createRequest: async (request: Partial<ShippingRequest>): Promise<ShippingRequestResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = request;

    try {
      const response = await api.post<ShippingRequestResponse>(
        `/user/requests`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi thêm yêu cầu');
    }
  },

  // Update Request
  updateRequest: async (request: Partial<ShippingRequest>): Promise<ShippingRequestResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = request;

    try {
      const response = await api.put<ShippingRequestResponse>(
        `/user/requests/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin yêu cầu');
    }
  },

  cancelRequest: async (requestId: number): Promise<ShippingRequestResponse> => {
    const res = await api.put<ShippingRequestResponse>(`/user/requests/cancel`, { requestId });
    return res.data;
  },

  listOfficeRequests: async (officeId: number, query: string): Promise<ShippingRequestResponse> => {
    const res = await api.get<ShippingRequestResponse>(`/manager/requests/${officeId}?${query}`);
    return res.data;
  },

  updateRequestByManager: async (
    requestId: number,
    data: { response?: string; status?: string }
  ): Promise<ShippingRequestResponse> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<ShippingRequestResponse>(
        `/manager/requests/${requestId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi cập nhật thông tin yêu cầu"
      );
    }
  },
}

export const transactionAPI = {
  getTransactionTypes: async (): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>('/protected/transactions/types');
    return response.data;
  },

  getTransactionStatuses: async (): Promise<TransactionResponse> => {
    const response = await api.get<TransactionResponse>('/protected/transactions/statuses');
    return response.data;
  },

  listUserTransactions: async (query: string): Promise<TransactionResponse> => {
    const res = await api.get<TransactionResponse>(`/user/transactions?${query}`);
    return res.data;
  },

  exportUserTransactions: async (query: string): Promise<TransactionResponse> => {
    const res = await api.get<TransactionResponse>(`/user/transactions/export?${query}`);
    return res.data;
  },

  listManagerTransactions: async (query: string): Promise<TransactionResponse> => {
    const res = await api.get<TransactionResponse>(`/manager/transactions?${query}`);
    return res.data;
  },

  exportManagerTransactions: async (query: string): Promise<TransactionResponse> => {
    const res = await api.get<TransactionResponse>(`/manager/transactions/export?${query}`);
    return res.data;
  },

  getManagerTransactionSummary: async (query: string): Promise<TransactionResponse> => {
    const res = await api.get<TransactionResponse>(`/manager/transactions/summary?${query}`);
    return res.data;
  },

  createTransaction: async (formData: FormData): Promise<TransactionResponse> => {
    const res = await api.post<TransactionResponse>("/manager/transactions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
}

export const paymentSubmissionAPI = {
  getPaymentSubmissionStatuses: async (): Promise<PaymentSubmissionResponse> => {
    const response = await api.get<PaymentSubmissionResponse>('/protected/submissions/statuses');
    return response.data;
  },

  getUserPendingOrdersSummary: async (): Promise<PaymentSubmissionResponse> => {
    const response = await api.get<PaymentSubmissionResponse>('/user/submissions/pending-summary');
    return response.data;
  },
  getUserConfirmedOrdersSummary: async (): Promise<PaymentSubmissionResponse> => {
    const response = await api.get<PaymentSubmissionResponse>('/user/submissions/confirmed-summary');
    return response.data;
  },

  listManagerPaymentSubmissions: async (query: string): Promise<PaymentSubmissionResponse> => {
    const res = await api.get<PaymentSubmissionResponse>(`/manager/submissions?${query}`);
    return res.data;
  },

  getPaymentSubmissionCountByStatus: async (): Promise<PaymentSubmissionResponse> => {
    const res = await api.get<PaymentSubmissionResponse>(`/manager/submissions/summary`);
    return res.data;
  },

  getOrdersOfPaymentSubmission: async (id: number, query: string): Promise<PaymentSubmissionResponse> => {
    const res = await api.get<PaymentSubmissionResponse>(`/manager/submissions/${id}?${query}`);
    return res.data;
  },

  updatePaymentSubmissionStatus: async (
    id: number,
    status: string,
    notes?: string
  ): Promise<PaymentSubmissionResponse> => {
    const res = await api.put<PaymentSubmissionResponse>(`/manager/submissions/${id}`, { status, notes });
    return res.data;
  },
}

export const orderHistoryAPI = {
  getWarehouseImportExportStatsByManager: async (query: string): Promise<OrderHistoryResponse> => {
    const response = await api.get<OrderHistoryResponse>(`/manager/order-histories/warehouse?${query}`);
    return response.data;
  },
}

export const shipmentAPI = {
  exportEmployeeShipments: async (id: number, query: string): Promise<ShipmentResponse> => {
    const res = await api.get<ShipmentResponse>(`/manager/shipments/employee/${id}/export?${query}`);
    return res.data;
  },

  listEmployeeShipments: async (id: number, query: string): Promise<ShipmentResponse> => {
    const res = await api.get<ShipmentResponse>(`/manager/shipments/employee/${id}?${query}`);
    return res.data;
  },

  getShipmentStatuses: async (): Promise<ShipmentResponse> => {
    const response = await api.get<ShipmentResponse>('/protected/shipments/statuses');
    return response.data;
  },
}

export const bankAccountAPI = {
  // Lấy danh sách tài khoản của user
  list: async (): Promise<BankAccountResponse> => {
    const res = await api.get<BankAccountResponse>('/user/accounts');
    return res.data;
  },

  // Thêm tài khoản mới
  add: async (payload: Partial<BankAccount>): Promise<BankAccountResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const res = await api.post<BankAccountResponse>('/user/accounts', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Sửa tài khoản
  update: async (id: number, payload: Partial<BankAccount>): Promise<BankAccountResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const res = await api.put<BankAccountResponse>(`/user/accounts/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Xóa tài khoản
  remove: async (id: number): Promise<BankAccountResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const res = await api.delete<BankAccountResponse>(`/user/accounts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Đặt tài khoản mặc định
  setDefault: async (id: number): Promise<BankAccountResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const res = await api.patch<BankAccountResponse>(`/user/accounts/${id}/default`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export const incidentAPI = {
  listOfficeIncidents: async (query: string): Promise<IncidentReportResponse> => {
    const res = await api.get<IncidentReportResponse>(`/manager/incidents?${query}`);
    return res.data;
  },

  handleIncident: async (id: number, data: { status?: string; resolution?: string }): Promise<IncidentReportResponse> => {
    const res = await api.patch<IncidentReportResponse>(`/manager/incidents/${id}`, data);
    return res.data;
  },

  getIncidentTypes: async (): Promise<IncidentReportResponse> => {
    const response = await api.get<IncidentReportResponse>('/protected/incidents/types');
    return response.data;
  },

  getIncidentStatuses: async (): Promise<IncidentReportResponse> => {
    const response = await api.get<IncidentReportResponse>('/protected/incidents/statuses');
    return response.data;
  },
};

export default api;