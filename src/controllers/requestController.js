import requestService from "../services/requestService";

const requestController = {
  async getTypesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await requestService.getTypesEnum(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Types Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getStatusesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await requestService.getStatusesEnum(userId);

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
  async getRequestsByUser(req, res) {
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

      const result = await requestService.getRequestsByUser(userId, page, limit, filters);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Requests By error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Add Request 
  async addRequest(req, res) {
    try {
      const userId = req.user.id;

      const { trackingNumber, requestContent, requestType } = req.body;

      const result = await requestService.addRequest(userId, trackingNumber, requestContent, requestType);

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

      const result = await requestService.updateRequest(userId, id, requestContent);

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

      const result = await requestService.cancelRequest(userId, requestId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Cancel Request error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi hủy yêu cầu",
      });
    }
  },

  async getRequestsByOffice(req, res) {
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

      const result = await requestService.getRequestsByOffice(userId, officeId, page, limit, filters);

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

export default requestController;
