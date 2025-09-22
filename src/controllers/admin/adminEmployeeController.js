import employeeService from '../../services/employeeService.js';

const list = async (req, res) => {
  try {
    const { page, limit, search, officeId, status, shift } = req.query;
    const result = await employeeService.listEmployees({ page, limit, search, officeId, status, shift });
    
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
    const result = await employeeService.getEmployeeById(req.params.id);
    
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
    const result = await employeeService.createEmployee(req.body);
    
    if (!result.success) {
      const statusCode = result.message.includes("đã là nhân viên") ? 409 : 400;
      return res.status(statusCode).json(result);
    }
    
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const result = await employeeService.updateEmployee(req.params.id, req.body);
    
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
    const result = await employeeService.deleteEmployee(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove };
