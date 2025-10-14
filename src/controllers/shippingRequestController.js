import shippingRequestService from "../services/shippingRequestService";

const shippingRequestController = {
  async getRequestTypes(req, res) {
    try {
      const userId = req.user.id;

      const result = await shippingRequestService.getRequestTypes(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Types Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getRequestStatuses(req, res) {
    try {

      const userId = req.user.id;

      const result = await shippingRequestService.getRequestStatuses(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Get Requests By User
  async listUserRequests(req, res) {
    try {
      const userId = req.user.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        requestType: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await shippingRequestService.listUserRequests(userId, page, limit, filters);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Requests By error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async createRequest(req, res) {
    try {
      const userId = req.user ? req.user.id : null; // kiểm tra user có đăng nhập không
      const { trackingNumber, requestContent, requestType, contactName, contactPhoneNumber, contactEmail, contactCityCode, contactWardCode, contactDetailAddress } = req.body;

      const data = {
        trackingNumber,
        requestContent,
        requestType,
        userId,
      };

      // Nếu user không có tài khoản, thêm thông tin liên hệ
      if (!userId) {
        data.contactName = contactName;
        data.contactPhoneNumber = contactPhoneNumber;
        data.contactEmail = contactEmail;
        data.contactCityCode = contactCityCode;
        data.contactWardCode = contactWardCode;
        data.contactDetailAddress = contactDetailAddress;
      }

      const result = await shippingRequestService.createRequest(data);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Request error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Update Request 
  async updateRequest(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const { requestContent } = req.body;

      const result = await shippingRequestService.updateRequest(userId, id, requestContent);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update Request error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async cancelRequest(req, res) {
    try {
      const userId = req.user.id;

      const { requestId } = req.body;

      const result = await shippingRequestService.cancelRequest(userId, requestId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Cancel Request error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi hủy yêu cầu",
      });
    }
  },

  async listOfficeRequests(req, res) {
    try {
      const userId = req.user.id;

      const officeId = parseInt(req.params.officeId);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        requestType: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await shippingRequestService.listOfficeRequests(userId, officeId, page, limit, filters);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Vehicles By Office error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};

export default shippingRequestController;