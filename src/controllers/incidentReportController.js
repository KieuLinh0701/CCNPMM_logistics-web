import IncidentReportService from "../services/incidentReportService.js";

const incidentReportController = {

  async getIncidentTypes(req, res) {
    try {
      const userId = req.user.id;
      const result = await IncidentReportService.getIncidentTypes(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Incident Types error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy danh sách trạng thái sự cố
  async getIncidentStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await IncidentReportService.getIncidentStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Incident Statuses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy danh sách báo cáo sự cố của bưu cục
  async listOfficeIncidents(req, res) {
    try {
      const managerId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        status: req.query.status || undefined,
        type: req.query.type || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await IncidentReportService.listOfficeIncidents(managerId, page, limit, filters);
      return res.status(200).json(result);

    } catch (error) {
      console.error('listOfficeIncidentsError:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Manager xử lý báo cáo sự cố
  async handleIncident(req, res) {
    try {
      const managerId = req.user.id;
      const incidentId = req.params.id;
      const data = req.body;

      const result = await IncidentReportService.handleIncident(managerId, incidentId, data);
      return res.status(200).json(result);

    } catch (error) {
      console.error('handleIncidentError:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

};

export default incidentReportController;