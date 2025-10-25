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

  async getTransactionStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await transactionService.getTransactionStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
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
  
  // ================================= Manager ===========================
  async listManagerTransactions(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        type: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await transactionService.listManagerTransactions(userId, page, limit, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Transactions By Manager error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async exportManagerTransactions(req, res) {
    try {
      const userId = req.user.id;

      const filters = {
        searchText: req.query.search || undefined,
        type: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await transactionService.exportManagerTransactions(userId, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Export Manager Transactions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async getManagerTransactionSummary(req, res) {
    try {
      const userId = req.user.id;

      const filters = {
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await transactionService.getManagerTransactionSummary(userId, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Manager Transaction Summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async createTransaction(req, res) {
    try {
      const userId = req.user.id;

      console.log("body", req.body)

      // Dữ liệu gửi lên từ frontend
      const { title, amount, notes } = req.body;
      const images = req.files || []; 

      console.log("files", images);

      const result = await transactionService.createTransaction(userId, {
        title,
        amount,
        notes,
        images,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: 'Tạo giao dịch thất bại',
      });
    }
  },

};

export default transactionController;