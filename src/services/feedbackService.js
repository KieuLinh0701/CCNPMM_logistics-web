import db from '../models/index.js';

const feedbackService = {
  // Tạo feedback mới
  async createFeedback(userId, orderId, data) {
    try {
      // Kiểm tra đơn hàng có tồn tại và thuộc về user này không
      const order = await db.Order.findOne({
        where: { id: orderId, userId },
      });

      if (!order) {
        return {
          success: false,
          message: 'Đơn hàng không tồn tại hoặc bạn không có quyền đánh giá đơn hàng này',
        };
      }

      // Kiểm tra đơn hàng đã được giao chưa
      if (order.status !== 'delivered') {
        return {
          success: false,
          message: 'Chỉ có thể đánh giá đơn hàng đã được giao thành công',
        };
      }

      // Kiểm tra đã có feedback cho đơn hàng này chưa
      const existingFeedback = await db.Feedback.findOne({
        where: { orderId },
      });

      if (existingFeedback) {
        return {
          success: false,
          message: 'Bạn đã đánh giá đơn hàng này rồi',
        };
      }

      // Tạo feedback mới
      const feedback = await db.Feedback.create({
        orderId,
        userId,
        rating: data.rating,
        comment: data.comment,
        serviceRating: data.serviceRating,
        deliveryRating: data.deliveryRating,
        isAnonymous: data.isAnonymous || false,
      });

      return {
        success: true,
        message: 'Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi!',
        data: feedback,
      };
    } catch (error) {
      console.error('Create feedback error:', error);
      return {
        success: false,
        message: 'Lỗi server khi tạo đánh giá',
      };
    }
  },

  // Cập nhật feedback
  async updateFeedback(userId, feedbackId, data) {
    try {
      const feedback = await db.Feedback.findOne({
        where: { id: feedbackId, userId },
      });

      if (!feedback) {
        return {
          success: false,
          message: 'Đánh giá không tồn tại hoặc bạn không có quyền cập nhật',
        };
      }

      await feedback.update({
        rating: data.rating || feedback.rating,
        comment: data.comment || feedback.comment,
        serviceRating: data.serviceRating || feedback.serviceRating,
        deliveryRating: data.deliveryRating || feedback.deliveryRating,
        isAnonymous: data.isAnonymous ?? feedback.isAnonymous,
      });

      return {
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: feedback,
      };
    } catch (error) {
      console.error('Update feedback error:', error);
      return {
        success: false,
        message: 'Lỗi server khi cập nhật đánh giá',
      };
    }
  },

  // Lấy feedback theo orderId
  async getFeedbackByOrder(orderId, userId) {
    try {
      const feedback = await db.Feedback.findOne({
        where: { orderId },
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.Order,
            as: 'order',
            attributes: ['id', 'trackingNumber'],
          },
        ],
      });

      if (!feedback) {
        return {
          success: false,
          message: 'Chưa có đánh giá cho đơn hàng này',
        };
      }

      // Kiểm tra quyền xem feedback (chỉ user tạo feedback hoặc admin mới xem được)
      if (feedback.userId !== userId) {
        return {
          success: false,
          message: 'Bạn không có quyền xem đánh giá này',
        };
      }

      return {
        success: true,
        data: feedback,
      };
    } catch (error) {
      console.error('Get feedback error:', error);
      return {
        success: false,
        message: 'Lỗi server khi lấy đánh giá',
      };
    }
  },

  // Lấy danh sách feedback của user
  async getUserFeedbacks(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await db.Feedback.findAndCountAll({
        where: { userId },
        limit,
        offset,
        include: [
          {
            model: db.Order,
            as: 'order',
            attributes: [
              'id',
              'trackingNumber',
              'status',
              'deliveredAt',
              'recipientName',
              'recipientPhone',
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return {
        success: true,
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.error('Get user feedbacks error:', error);
      return {
        success: false,
        message: 'Lỗi server khi lấy danh sách đánh giá',
      };
    }
  },

  // Lấy thống kê feedback (cho admin)
  async getFeedbackStats(filters = {}) {
    try {
      const where = {};

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt[db.Sequelize.Op.gte] = filters.startDate;
        if (filters.endDate) where.createdAt[db.Sequelize.Op.lte] = filters.endDate;
      }

      // Tổng số feedback
      const totalFeedbacks = await db.Feedback.count({ where });

      // Điểm trung bình
      const avgRating = await db.Feedback.findOne({
        where,
        attributes: [[db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating']],
        raw: true,
      });

      // Phân bổ theo điểm số
      const ratingDistribution = await db.Feedback.findAll({
        where,
        attributes: [
          'rating',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        ],
        group: ['rating'],
        raw: true,
      });

      return {
        success: true,
        data: {
          totalFeedbacks,
          avgRating: parseFloat(avgRating?.avgRating || 0).toFixed(2),
          ratingDistribution,
        },
      };
    } catch (error) {
      console.error('Get feedback stats error:', error);
      return {
        success: false,
        message: 'Lỗi server khi lấy thống kê đánh giá',
      };
    }
  },

  // Xóa feedback
  async deleteFeedback(userId, feedbackId) {
    try {
      const feedback = await db.Feedback.findOne({
        where: { id: feedbackId, userId },
      });

      if (!feedback) {
        return {
          success: false,
          message: 'Đánh giá không tồn tại hoặc bạn không có quyền xóa',
        };
      }

      await feedback.destroy();

      return {
        success: true,
        message: 'Xóa đánh giá thành công',
      };
    } catch (error) {
      console.error('Delete feedback error:', error);
      return {
        success: false,
        message: 'Lỗi server khi xóa đánh giá',
      };
    }
  },
};

export default feedbackService;


