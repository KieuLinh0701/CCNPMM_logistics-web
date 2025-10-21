import transactionService from "../services/transactionService.js";

const transactionController = {
  async getTransactionTypes(req, res) {
    try {
      const userId = req.user.id;
      const result = await transactionService.getTransactionTypes(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Types Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async listUserTransactions(req, res) {
      try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
  
        const filters = {
          searchText: req.query.search || undefined,
          type: req.query.type || undefined,
          sort: req.query.sort || undefined,
          startDate: req.query.startDate || undefined,
          endDate: req.query.endDate || undefined,
        };

        console.log("type", req.query.type);
  
        const result = await transactionService.listUserTransactions(userId, page, limit, filters);
        return res.status(200).json(result);
      } catch (error) {
        console.error('Get Transactions By User error:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server'
        });
      }
    },

    async exportUserTransactions(req, res) {
      try {
        const userId = req.user.id;
  
        const filters = {
          searchText: req.query.search || undefined,
          type: req.query.type || undefined,
          sort: req.query.sort || undefined,
          startDate: req.query.startDate || undefined,
          endDate: req.query.endDate || undefined,
        };

        console.log("type", req.query.type);
  
        const result = await transactionService.exportUserTransactions(userId, filters);
        return res.status(200).json(result);
      } catch (error) {
        console.error('Get Export User Transactions error:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server'
        });
      }
    },
};

export default transactionController;