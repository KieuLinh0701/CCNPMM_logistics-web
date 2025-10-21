import api from './api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: number;
  relatedType?: string;
  userId: number;
  officeId?: number;
  targetRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data?: {
    notifications: NotificationItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    unreadCount: number;
  };
  message?: string;
}

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async (params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    isRead?: boolean 
  }): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>('/notifications', { params });
    return response.data;
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put<{ success: boolean; message?: string }>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put<{ success: boolean; message?: string }>('/notifications/mark-all-read');
    return response.data;
  },

  // Xóa thông báo
  deleteNotification: async (notificationId: number): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete<{ success: boolean; message?: string }>(`/notifications/${notificationId}`);
    return response.data;
  }
};

