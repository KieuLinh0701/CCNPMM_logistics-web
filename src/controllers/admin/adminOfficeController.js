import officeService from '../../services/officeService.js';

const list = async (req, res) => {
  try {
    const { page, limit, search, type, status } = req.query;
    const result = await officeService.listOffices({ page, limit, search, type, status });
    
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
    const result = await officeService.getOfficeById(req.params.id);
    
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
    const result = await officeService.createOffice(req.body);
    
    if (!result.success) {
      const statusCode = result.message.includes("đã tồn tại") ? 409 : 400;
      return res.status(statusCode).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const result = await officeService.updateOffice(req.params.id, req.body);
    
    if (!result.success) {
      const statusCode = result.message.includes("đã tồn tại") ? 409 : 404;
      return res.status(statusCode).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await officeService.deleteOffice(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove };
