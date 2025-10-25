import shipmentService from "../services/shipmentService";

const shipmentController = {
  async listEmployeeShipments(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await shipmentService.listEmployeeShipments(userId, id, page, limit, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('listEmployeeShipmentsError:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getShipmentStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await shipmentService.getShipmentStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

};

export default shipmentController;