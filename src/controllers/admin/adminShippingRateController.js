import shippingRateService from '../../services/shippingRateService.js';

const list = async (req, res) => {
  try {
    const { page, limit, search, serviceTypeId, regionType } = req.query;
    const result = await shippingRateService.listShippingRates({ page, limit, search, serviceTypeId, regionType });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await shippingRateService.getShippingRateById(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const result = await shippingRateService.createShippingRate(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const result = await shippingRateService.updateShippingRate(req.params.id, req.body);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await shippingRateService.deleteShippingRate(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const calculateCost = async (req, res) => {
  try {
    const { serviceTypeId, regionType, weight } = req.query;
    const result = await shippingRateService.calculateShippingCost(serviceTypeId, regionType, weight);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove, calculateCost };
