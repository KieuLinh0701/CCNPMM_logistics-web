import shippingRateService from '../services/shippingRateService.js';

const shippingRateController = {
  // Admin CRUD
  async list(req, res) {
    try {
      const { page, limit, search, serviceTypeId, regionId } = req.query;
      const result = await shippingRateService.listShippingRates({ 
        page, 
        limit, 
        search, 
        serviceTypeId, 
        regionId 
      });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await shippingRateService.getShippingRateById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await shippingRateService.createShippingRate(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await shippingRateService.updateShippingRate(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await shippingRateService.deleteShippingRate(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async calculateCost(req, res) {
    try {
      const { serviceTypeId, regionId, weight, distance } = req.query;
      const result = await shippingRateService.calculateShippingCost({
        serviceTypeId,
        regionId,
        weight,
        distance
      });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Public method for guests
  async getPublicShippingRates(req, res) {
    try {
      const { serviceTypeId } = req.query;
      const result = await shippingRateService.getPublicShippingRates(serviceTypeId);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default shippingRateController;

