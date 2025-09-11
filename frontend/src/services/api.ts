import axios from 'axios';
import { RegisterData, LoginData, VerifyOTPData, AuthResponse, ForgotPasswordData, VerifyResetOTPData, ResetPasswordData } from '../types/auth';
import { Office, OfficeResponse } from '../types/office';
import { Employee, EmployeeCheckResult, EmployeeResponse } from '../types/employee';
import { getAssignableRoles } from '../store/authSlice';
import { addEmployee } from '../store/employeeSlice';

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

export default api;