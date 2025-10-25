import serviceType from "../models/serviceType.js";
import orderHistoryService from "../services/orderHistoryService.js";
import transactionService from "../services/transactionService.js";

const orderHistoryController = {
  async getWarehouseImportExportStatsByManager(req, res) {
    try {
      const userId = req.user.id;

      const filters = {
        searchText: req.query.search || undefined,
        serviceTypeId: req.query.serviceType || undefined,
        sort: req.query.sort || undefined,
      };

      const result = await orderHistoryService.getWarehouseImportExportStatsByManager(userId, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('getWarehouseImportExportStatsByManagerError:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};

export default orderHistoryController;