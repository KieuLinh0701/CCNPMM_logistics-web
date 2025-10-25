import exportService from '../services/exportService.js';

const exportController = {
  // Xuất báo cáo Excel
  async exportFinancialReportExcel(req, res) {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu dữ liệu để xuất báo cáo'
        });
      }

      const result = await exportService.exportToExcel(data, 'financial_report');

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      console.error('Export Excel error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Xuất báo cáo PDF
  async exportFinancialReportPDF(req, res) {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu dữ liệu để xuất báo cáo'
        });
      }

      const result = await exportService.exportToPDF(data, 'financial_report');

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      console.error('Export PDF error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

export default exportController;
