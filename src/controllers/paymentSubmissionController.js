import paymentSubmissionService from "../services/paymentSubmissionService.js";

const paymentSubmissionController = {
  async getPaymentSubmissionStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await paymentSubmissionService.getPaymentSubmissionStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Payment Submission Statuses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getUserPendingOrdersSummary(req, res) {
    try {
      const userId = req.user.id;
      const result = await paymentSubmissionService.getUserPendingOrdersSummary(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get User Pending Orders Summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getUserConfirmedOrdersSummary(req, res) {
    try {
      const userId = req.user.id;
      const result = await paymentSubmissionService.getUserConfirmedOrdersSummary(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get User Confirmed Orders Summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async listManagerPaymentSubmissions(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await paymentSubmissionService.listManagerPaymentSubmissions(userId, page, limit, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("listManagerPaymentSubmissions:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách đối soát của bưu cục",
      });
    }
  },

  async getOrdersOfPaymentSubmission(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await paymentSubmissionService.getOrdersOfPaymentSubmission(userId, id, page, limit,);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("getOrdersOfPaymentSubmission:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách đơn hàng 1 đối soát của bưu cục",
      });
    }
  },

  async updatePaymentSubmissionStatus(req, res) {
    try {
      const userId = req.user.id; 
      const { id } = req.params; 
      const { status, notes } = req.body; 

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp trạng thái mới",
        });
      }

      const result = await paymentSubmissionService.updatePaymentSubmissionStatus({
        userId,
        submissionId: id,
        status,
        notes,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: result.data,
      });
    } catch (error) {
      console.error("updatePaymentSubmissionStatus:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái Payment Submission",
      });
    }
  },

  async getPaymentSubmissionCountByStatus(req, res) {
    try {
      const userId = req.user.id; 

      const result = await paymentSubmissionService.getPaymentSubmissionCountByStatus(userId);

      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      console.error("getPaymentSubmissionCountByStatus:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi số lượng các đối soát theo từng trạng thái",
      });
    }
  },
};

export default paymentSubmissionController;