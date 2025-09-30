import vehicleService from '../services/vehicleService.js';

const vehicleController = {
  // Admin CRUD
  async list(req, res) {
    try {
      const { page, limit, search, type, status } = req.query;
      const result = await vehicleService.listVehicles({ page, limit, search, type, status });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await vehicleService.getVehicleById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await vehicleService.createVehicle(req.body);
      if (!result.success) {
        const statusCode = result.message.includes('đã tồn tại') ? 409 : 400;
        return res.status(statusCode).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await vehicleService.updateVehicle(req.params.id, req.body);
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
      const result = await vehicleService.deleteVehicle(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStats(req, res) {
    try {
      const result = await vehicleService.getVehicleStats();
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default vehicleController;

