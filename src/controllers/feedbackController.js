import feedbackService from '../services/feedbackService.js';

const feedbackController = {
  // Tạo feedback mới
  async createFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { rating, comment, serviceRating, deliveryRating, isAnonymous } = req.body;

      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn điểm đánh giá từ 1 đến 5 sao',
        });
      }

      const result = await feedbackService.createFeedback(userId, orderId, {
        rating,
        comment,
        serviceRating,
        deliveryRating,
        isAnonymous,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create feedback controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đánh giá',
      });
    }
  },

  // Cập nhật feedback
  async updateFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { feedbackId } = req.params;
      const { rating, comment, serviceRating, deliveryRating, isAnonymous } = req.body;

      const result = await feedbackService.updateFeedback(userId, feedbackId, {
        rating,
        comment,
        serviceRating,
        deliveryRating,
        isAnonymous,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update feedback controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật đánh giá',
      });
    }
  },

  // Lấy feedback theo orderId
  async getFeedbackByOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const result = await feedbackService.getFeedbackByOrder(orderId, userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get feedback by order controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đánh giá',
      });
    }
  },

  // Lấy danh sách feedback của user
  async getUserFeedbacks(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await feedbackService.getUserFeedbacks(userId, page, limit);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get user feedbacks controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách đánh giá',
      });
    }
  },

  // Lấy thống kê feedback (cho admin)
  async getFeedbackStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const result = await feedbackService.getFeedbackStats({
        startDate,
        endDate,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get feedback stats controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê đánh giá',
      });
    }
  },

  // Xóa feedback
  async deleteFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { feedbackId } = req.params;

      const result = await feedbackService.deleteFeedback(userId, feedbackId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Delete feedback controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đánh giá',
      });
    }
  },
};

export default feedbackController;

