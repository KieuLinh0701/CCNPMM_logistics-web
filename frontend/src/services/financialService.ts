import api from './api';

export interface FinancialStats {
  summary: {
    totalOrders: number;
    totalCOD: number;
    totalShippingFee: number;
    totalDiscount: number;
    totalRevenue: number;
    deliveredOrders: number;
    codCollected: number;
    shippingFeeCollected: number;
    successRate: number;
  };
  officeStats: Array<{
    toOfficeId: number;
    orderCount: number;
    totalCOD: number;
    totalShippingFee: number;
    totalRevenue: number;
    deliveredCount: number;
    toOffice: {
      id: number;
      name: string;
      address: string;
    };
  }>;
  serviceTypeStats: Array<{
    serviceTypeId: number;
    orderCount: number;
    totalCOD: number;
    totalShippingFee: number;
    totalRevenue: number;
    serviceType: {
      id: number;
      name: string;
    };
  }>;
  monthlyStats: Array<{
    month: string;
    orderCount: number;
    totalCOD: number;
    totalShippingFee: number;
    totalRevenue: number;
  }>;
}

export interface ReconciliationHistory {
  orders: Array<{
    id: number;
    trackingNumber: string;
    recipientName: string;
    recipientPhone: string;
    cod: number;
    shippingFee: number;
    discountAmount: number;
    totalFee: number;
    status: string;
    deliveredAt: string;
    createdAt: string;
    toOffice: {
      id: number;
      name: string;
      address: string;
    };
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    serviceType: {
      id: number;
      name: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  summary: {
    totalOrders: number;
    totalCOD: number;
    totalShippingFee: number;
    totalRevenue: number;
  };
}

export interface ComprehensiveReport {
  totalOrders: number;
  totalOffices: number;
  totalEmployees: number;
  totalVehicles: number;
  successRate: number;
  totalRevenue: number;
}

export const financialAPI = {
  // Lấy thống kê tài chính
  getFinancialStats: async (filters: {
    startDate?: string;
    endDate?: string;
    officeId?: number;
    regionType?: string;
  }): Promise<{ success: boolean; data: FinancialStats }> => {
    const response = await api.get<{ success: boolean; data: FinancialStats }>('/admin/financial/stats', { params: filters });
    return response.data;
  },

  // Lấy lịch sử đối soát
  getReconciliationHistory: async (filters: {
    startDate?: string;
    endDate?: string;
    officeId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: ReconciliationHistory }> => {
    const response = await api.get<{ success: boolean; data: ReconciliationHistory }>('/admin/financial/reconciliation', { params: filters });
    return response.data;
  },

  // Lấy báo cáo tổng hợp
  getComprehensiveReport: async (filters: {
    startDate?: string;
    endDate?: string;
    officeId?: number;
    regionType?: string;
  }): Promise<{ success: boolean; data: ComprehensiveReport }> => {
    const response = await api.get<{ success: boolean; data: ComprehensiveReport }>('/admin/financial/report', { params: filters });
    return response.data;
  },

  // Xuất báo cáo Excel
  exportToExcel: async (data: FinancialStats): Promise<Blob> => {
    const response = await api.post<Blob>('/admin/export/excel', { data }, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Xuất báo cáo PDF
  exportToPDF: async (data: FinancialStats): Promise<Blob> => {
    const response = await api.post<Blob>('/admin/export/pdf', { data }, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default financialAPI;
