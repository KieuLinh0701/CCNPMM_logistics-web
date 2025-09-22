import db from '../models/index.js';

// List service types with pagination and search
const listServiceTypes = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (search) {
        where[db.Sequelize.Op.or] = [
          { name: { [db.Sequelize.Op.like]: `%${search}%` } },
          { deliveryTime: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }
      
      const { rows, count } = await db.ServiceType.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]] 
      });
      
      resolve({
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get service type by ID
const getServiceTypeById = async (serviceTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        resolve({ success: false, message: "Không tìm thấy loại dịch vụ" });
        return;
      }
      resolve({ success: true, data: serviceType });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new service type
const createServiceType = async (serviceTypeData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, deliveryTime, status = "active" } = serviceTypeData;
      
      if (!name) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      const created = await db.ServiceType.create({ name, deliveryTime, status });
      
      resolve({ success: true, data: created });
    } catch (error) {
      reject(error);
    }
  });
};

// Update service type
const updateServiceType = async (serviceTypeId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, deliveryTime, status } = updateData;
      
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        resolve({ success: false, message: "Không tìm thấy loại dịch vụ" });
        return;
      }
      
      // Update fields
      if (typeof name !== "undefined") serviceType.name = name;
      if (typeof deliveryTime !== "undefined") serviceType.deliveryTime = deliveryTime;
      if (typeof status !== "undefined") serviceType.status = status;
      
      await serviceType.save();
      resolve({ success: true, data: serviceType });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete service type
const deleteServiceType = async (serviceTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        resolve({ success: false, message: "Không tìm thấy loại dịch vụ" });
        return;
      }
      
      await serviceType.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType
};

