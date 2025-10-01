import officeService from '../services/officeService.js';

const officeController = {
  // Get Office By User Id
  async getOfficeByUser(req, res) {
    try {
      const userId = req.user.id;
      const result = await officeService.getByUserId(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Office By UserId error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Update Office by user
  async update(req, res) {
    try {
      const userId = req.user.id;
      const officeId = req.params.id;
      const updateData = req.body;
      if (!officeId) return res.status(400).json({ success: false, message: 'Office id không được để trống' });
      const result = await officeService.update(userId, officeId, updateData);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Update office error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin CRUD
  async list(req, res) {
    try {
      const { page, limit, search, type, status } = req.query;
      const result = await officeService.listOffices({ page, limit, search, type, status });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await officeService.getOfficeById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await officeService.createOffice(req.body);
      if (!result.success) {
        const statusCode = result.message.includes('đã tồn tại') ? 409 : 400;
        return res.status(statusCode).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async adminUpdate(req, res) {
    try {
      const result = await officeService.updateOffice(req.params.id, req.body);
      if (!result.success) {
        const statusCode = result.message.includes('đã tồn tại') ? 409 : 404;
        return res.status(statusCode).json(result);
      }
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await officeService.deleteOffice(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async searchOffices(req, res) {
    try {
      const { city, ward, search } = req.query;
      const result = await officeService.searchOffices({ city, ward, search });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getPublicOffices(req, res) {
    try {
      const { page, limit, city } = req.query;
      const result = await officeService.getPublicOffices({ page, limit, city });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default officeController;
