import axios from 'axios';
import { RegisterData, LoginData, VerifyOTPData, AuthResponse, ForgotPasswordData, VerifyResetOTPData, ResetPasswordData } from '../types/auth';
import { Office, OfficeResponse } from '../types/office';
import { Employee, EmployeeCheckResult, EmployeeResponse } from '../types/employee';
import { ServiceTypeResponse } from '../types/serviceType';
import { Order, OrderResponse } from '../types/order';
import { getProductsByUser } from '../store/productSlice';
import { ImportProductsResponse, product, ProductResponse } from '../types/product';
import { PromotionResponse } from '../types/promotion';
import { cancelOrder, getPayersEnum, getPaymentStatusesEnum } from '../store/orderSlice';
import { ImportVehiclesResponse, Vehicle, VehicleResponse } from '../types/vehicle';
import { ShippingRequest, ShippingRequestResponse } from '../types/shippingRequest';

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

  // Get Assignable Roles
  getAssignableRoles: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>('/auth/roles/assignable');
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
  getStatusesEnum: async (): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>('/products/statuses');
    return response.data;
  },

  // Get Types Enum
  getTypesEnum: async (): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>('/products/types');
    return response.data;
  },

  getProductsByUser: async (query: string): Promise<ProductResponse> => {
    const res = await api.get<ProductResponse>(`/products?${query}`);
    return res.data;
  },

  addProduct: async (product: Partial<product>): Promise<ProductResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = product;

    try {
      const response = await api.post<ProductResponse>(
        `/products/add`,
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
        `/products/${id}`,
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
        `/products/import`,
        { products },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi import sản phẩm');
    }
  },

  getActiveProductsByUser: async (query: string): Promise<ProductResponse> => {
    const res = await api.get<ProductResponse>(`/products/get-active?${query}`);
    return res.data;
  },
}

export const orderAPI = {
  calculateShippingFee: async (weight: number, serviceTypeId: number, senderCodeCity: number, recipientCodeCity: number
  ): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(
      '/orders/calculate-shipping-fee',
      {
        params: { weight, serviceTypeId, senderCodeCity, recipientCodeCity, },
      }
    );
    return response.data;
  },

  // Get Statuses Enum
  getStatusesEnum: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/orders/statuses');
    return response.data;
  },

  // Get Payment Methods Enum
  getPaymentMethodsEnum: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/orders/payment-methods');
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.post<OrderResponse>(
        '/orders/create',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  },

  getOrdersByUser: async (query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/orders/by-user?${query}`);
    return res.data;
  },

  // Get Payers Enum
  getPayersEnum: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/orders/payers');
    return response.data;
  },

  // Get Payment Statuses Enum
  getPaymentStatusesEnum: async (): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>('/orders/payment-statuses');
    return response.data;
  },

  cancelOrder: async (orderId: number): Promise<OrderResponse> => {
    const res = await api.put<OrderResponse>(`/orders/cancel`, { orderId });
    return res.data;
  },

  getOrderByTrackingNumber: async (trackingNumber: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/orders/${trackingNumber}`);
    return res.data;
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

  // Create new order
  updateOrder: async (orderData: Order): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        '/orders/edit',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng');
    }
  },

  updateOrderStatusToPending: async (orderId: number): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        '/orders/to-pending',
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

  getOrdersByOffice: async (officeId: number, query: string): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/orders/by-office/${officeId}?${query}`);
    return res.data;
  },

  confirmOrderAndAssignToOffice: async (orderId: number, officeId: number): Promise<OrderResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    try {
      const response = await api.put<OrderResponse>(
        `/orders/confirm`,
        { orderId, officeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xác nhận đơn hàng');
    }
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
  getStatusesEnum: async (): Promise<ShippingRequestResponse> => {
    const response = await api.get<ShippingRequestResponse>('/requests/get-statuses');
    return response.data;
  },

  // Get Types Enum
  getTypesEnum: async (): Promise<ShippingRequestResponse> => {
    const response = await api.get<ShippingRequestResponse>('/requests/get-types');
    return response.data;
  },

  getRequestsByUser: async (query: string): Promise<ShippingRequestResponse> => {
    const res = await api.get<ShippingRequestResponse>(`/requests?${query}`);
    return res.data;
  },

  addRequest: async (request: Partial<ShippingRequest>): Promise<ShippingRequestResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Không tìm thấy token xác thực");

    const { id, ...payload } = request;

    try {
      const response = await api.post<ShippingRequestResponse>(
        `/requests`,
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
        `/requests/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin yêu cầu');
    }
  },

  cancelRequest: async (requestId: number): Promise<ShippingRequestResponse> => {
    const res = await api.put<ShippingRequestResponse>(`/requests/cancel`, { requestId });
    return res.data;
  },

  getRequestsByOffice: async (officeId: number, query: string): Promise<ShippingRequestResponse> => {
    const res = await api.get<ShippingRequestResponse>(`/requests/by-office/${officeId}?${query}`);
    return res.data;
  },
}

export default api;