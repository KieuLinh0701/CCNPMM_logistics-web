import financialService from '../services/financialService.js';

const financialController = {
  // Lấy thống kê tài chính
  async getFinancialStats(req, res) {
    try {
      const {
        startDate,
        endDate,
        officeId,
        regionType
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        officeId: officeId ? parseInt(officeId) : null,
        regionType: regionType || null
      };

      const result = await financialService.getFinancialStats(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get financial stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy lịch sử đối soát
  async getReconciliationHistory(req, res) {
    try {
      const {
        startDate,
        endDate,
        officeId,
        page = 1,
        limit = 10
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        officeId: officeId ? parseInt(officeId) : null,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await financialService.getReconciliationHistory(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get reconciliation history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy báo cáo tổng hợp
  async getComprehensiveReport(req, res) {
    try {
      const {
        startDate,
        endDate,
        officeId,
        regionType
      } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        officeId: officeId ? parseInt(officeId) : null,
        regionType: regionType || null
      };

      const result = await financialService.getComprehensiveReport(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Get comprehensive report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

export default financialController;
