import notificationService from '../services/notificationService.js';
import { emitToUser } from '../socket.js';

const notificationController = {
  // Lấy danh sách thông báo của shipper
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, type, isRead } = req.query;
      
      const result = await notificationService.getNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const result = await notificationService.markAsRead(userId, notificationId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await notificationService.markAllAsRead(userId);

      return res.json(result);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Xóa thông báo
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const result = await notificationService.deleteNotification(userId, notificationId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Tạo thông báo mới (cho admin/manager)
  async createNotification(req, res) {
    try {
      const { userId, type, title, message, relatedId, relatedType, officeId } = req.body;

      const result = await notificationService.createNotification({
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        officeId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Emit realtime notification
      emitToUser(userId, 'notification', {
        id: result.data.id,
        type: result.data.type,
        title: result.data.title,
        message: result.data.message,
        isRead: result.data.isRead,
        createdAt: result.data.createdAt
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
};

export default notificationController;



