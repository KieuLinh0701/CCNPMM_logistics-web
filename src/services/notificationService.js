import db from '../models/index.js';

const notificationService = {
  // Tạo thông báo mới
  async createNotification(data) {
    try {
      const notification = await db.Notification.create({
        title: data.title,
        message: data.message,
        type: data.type,
        isRead: false,
        relatedId: data.relatedId || null,
        relatedType: data.relatedType || null,
        userId: data.userId,
        officeId: data.officeId || null,
        targetRole: data.targetRole || 'shipper'
      });

      return {
        success: true,
        data: notification,
        message: 'Tạo thông báo thành công'
      };
    } catch (error) {
      console.error('Create notification error:', error);
      return {
        success: false,
        message: 'Lỗi khi tạo thông báo',
        error: error.message
      };
    }
  },

  // Lấy thông báo của user
  async getNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 10, type, isRead } = options;
      const offset = (page - 1) * limit;

      const whereClause = {
        userId,
        ...(type && { type }),
        ...(isRead !== undefined && { isRead })
      };

      const { count, rows: notifications } = await db.Notification.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      // Đếm số thông báo chưa đọc
      const unreadCount = await db.Notification.count({
        where: {
          userId,
          isRead: false
        }
      });

      return {
        success: true,
        data: {
          notifications,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
          },
          unreadCount
        }
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách thông báo',
        error: error.message
      };
    }
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(userId, notificationId) {
    try {
      const notification = await db.Notification.findOne({
        where: {
          id: notificationId,
          userId
        }
      });

      if (!notification) {
        return {
          success: false,
          message: 'Không tìm thấy thông báo'
        };
      }

      await notification.update({ isRead: true });

      return {
        success: true,
        message: 'Đã đánh dấu thông báo đã đọc'
      };
    } catch (error) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        message: 'Lỗi khi đánh dấu thông báo đã đọc',
        error: error.message
      };
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId) {
    try {
      await db.Notification.update(
        { isRead: true },
        {
          where: {
            userId,
            isRead: false
          }
        }
      );

      return {
        success: true,
        message: 'Đã đánh dấu tất cả thông báo đã đọc'
      };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return {
        success: false,
        message: 'Lỗi khi đánh dấu tất cả thông báo đã đọc',
        error: error.message
      };
    }
  },

  // Xóa thông báo
  async deleteNotification(userId, notificationId) {
    try {
      const notification = await db.Notification.findOne({
        where: {
          id: notificationId,
          userId
        }
      });

      if (!notification) {
        return {
          success: false,
          message: 'Không tìm thấy thông báo'
        };
      }

      await notification.destroy();

      return {
        success: true,
        message: 'Xóa thông báo thành công'
      };
    } catch (error) {
      console.error('Delete notification error:', error);
      return {
        success: false,
        message: 'Lỗi khi xóa thông báo',
        error: error.message
      };
    }
  },

  // Tạo thông báo cho shipper khi có đơn hàng mới
  async notifyNewOrder(shipperUserId, orderData, officeId) {
    try {
      return await this.createNotification({
        userId: shipperUserId,
        officeId,
        type: 'new_order',
        title: 'Có đơn hàng mới cho shipper',
        message: `Bạn có đơn hàng mới #${orderData.orderCode || orderData.id} cần giao`,
        relatedId: orderData.id,
        relatedType: 'order'
      });
    } catch (error) {
      console.error('Notify new order error:', error);
      return { success: false, message: 'Lỗi khi tạo thông báo đơn hàng mới' };
    }
  },

  // Tạo thông báo khi đơn hàng được phân công
  async notifyOrderAssigned(shipperUserId, orderData, officeId) {
    try {
      return await this.createNotification({
        userId: shipperUserId,
        officeId,
        type: 'delivery_assigned',
        title: 'Đơn hàng được phân công',
        message: `Đơn hàng #${orderData.orderCode || orderData.id} đã được phân công cho bạn`,
        relatedId: orderData.id,
        relatedType: 'order'
      });
    } catch (error) {
      console.error('Notify order assigned error:', error);
      return { success: false, message: 'Lỗi khi tạo thông báo phân công đơn hàng' };
    }
  },

  // Tạo thông báo thay đổi tuyến đường
  async notifyRouteChange(shipperUserId, routeData, officeId) {
    try {
      return await this.createNotification({
        userId: shipperUserId,
        officeId,
        type: 'route_change',
        title: 'Thay đổi tuyến đường',
        message: 'Tuyến đường giao hàng đã được cập nhật',
        relatedId: routeData?.id || null,
        relatedType: 'route'
      });
    } catch (error) {
      console.error('Notify route change error:', error);
      return { success: false, message: 'Lỗi khi tạo thông báo thay đổi tuyến đường' };
    }
  },

  // Tạo thông báo nhắc nhở COD
  async notifyCODReminder(shipperUserId, orderData, officeId) {
    try {
      return await this.createNotification({
        userId: shipperUserId,
        officeId,
        type: 'cod_reminder',
        title: 'Nhắc nhở thu COD',
        message: `Nhớ thu tiền COD cho đơn hàng #${orderData.orderCode || orderData.id}`,
        relatedId: orderData.id,
        relatedType: 'order'
      });
    } catch (error) {
      console.error('Notify COD reminder error:', error);
      return { success: false, message: 'Lỗi khi tạo thông báo nhắc nhở COD' };
    }
  }
};

export default notificationService;

