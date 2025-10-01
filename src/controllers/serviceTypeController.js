import serviceTypeService from "../services/serviceTypeService.js";

const serviceTypeController = {
  // Public: get active service types
  async getActiveServiceTypes(req, res) {
    try {
      const result = await serviceTypeService.getActiveServiceTypes();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Type Service Active error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin CRUD
  async list(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await serviceTypeService.listServiceTypes({ page, limit, search });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await serviceTypeService.getServiceTypeById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await serviceTypeService.createServiceType(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await serviceTypeService.updateServiceType(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await serviceTypeService.deleteServiceType(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Public method for guests
  async getPublicServiceTypes(req, res) {
    try {
      const result = await serviceTypeService.getActiveServiceTypes();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Public Service Types error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },
};

export default serviceTypeController;
