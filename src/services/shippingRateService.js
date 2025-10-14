import db from '../models/index.js';

// List shipping rates with pagination and search
const listShippingRates = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "", serviceTypeId, regionType } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (serviceTypeId) {
        where.serviceTypeId = serviceTypeId;
      }
      
      if (regionType) {
        where.regionType = regionType;
      }
      
      const { rows, count } = await db.ShippingRate.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime']
          }
        ]
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

// Get shipping rate by ID
const getShippingRateById = async (shippingRateId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shippingRate = await db.ShippingRate.findByPk(shippingRateId, {
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime', 'status']
          }
        ]
      });
      
      if (!shippingRate) {
        resolve({ success: false, message: "Không tìm thấy bảng giá vận chuyển" });
        return;
      }
      resolve({ success: true, data: shippingRate });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new shipping rate
const createShippingRate = async (shippingRateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { serviceTypeId, regionType, weightFrom, weightTo, price, unit = 0.5, extraPrice } = shippingRateData;
      
      if (!serviceTypeId || !regionType || !weightFrom || !price) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      // Check if service type exists
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        resolve({ success: false, message: "Không tìm thấy loại dịch vụ" });
        return;
      }
      
      // Validate weight range
      if (weightFrom < 0) {
        resolve({ success: false, message: "Trọng lượng từ phải lớn hơn hoặc bằng 0" });
        return;
      }
      
      if (weightTo && weightTo <= weightFrom) {
        resolve({ success: false, message: "Trọng lượng đến phải lớn hơn trọng lượng từ" });
        return;
      }
      
      if (price < 0) {
        resolve({ success: false, message: "Giá phải lớn hơn hoặc bằng 0" });
        return;
      }
      
      const created = await db.ShippingRate.create({ 
        serviceTypeId, regionType, weightFrom, weightTo, price, unit, extraPrice
      });
      
      // Fetch the created shipping rate with includes
      const newShippingRate = await db.ShippingRate.findByPk(created.id, {
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime']
          }
        ]
      });
      
      resolve({ success: true, data: newShippingRate });
    } catch (error) {
      reject(error);
    }
  });
};

// Update shipping rate
const updateShippingRate = async (shippingRateId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { serviceTypeId, regionType, weightFrom, weightTo, price, unit, extraPrice } = updateData;
      
      const shippingRate = await db.ShippingRate.findByPk(shippingRateId);
      if (!shippingRate) {
        resolve({ success: false, message: "Không tìm thấy bảng giá vận chuyển" });
        return;
      }
      
      // Check if new service type exists
      if (serviceTypeId && serviceTypeId !== shippingRate.serviceTypeId) {
        const serviceType = await db.ServiceType.findByPk(serviceTypeId);
        if (!serviceType) {
          resolve({ success: false, message: "Không tìm thấy loại dịch vụ" });
          return;
        }
      }
      
      // Validate weight range
      if (weightFrom !== undefined && weightFrom < 0) {
        resolve({ success: false, message: "Trọng lượng từ phải lớn hơn hoặc bằng 0" });
        return;
      }
      
      if (weightTo !== undefined && weightFrom !== undefined && weightTo <= weightFrom) {
        resolve({ success: false, message: "Trọng lượng đến phải lớn hơn trọng lượng từ" });
        return;
      }
      
      if (price !== undefined && price < 0) {
        resolve({ success: false, message: "Giá phải lớn hơn hoặc bằng 0" });
        return;
      }
      
      // Update fields
      if (typeof serviceTypeId !== "undefined") shippingRate.serviceTypeId = serviceTypeId;
      if (typeof regionType !== "undefined") shippingRate.regionType = regionType;
      if (typeof weightFrom !== "undefined") shippingRate.weightFrom = weightFrom;
      if (typeof weightTo !== "undefined") shippingRate.weightTo = weightTo;
      if (typeof price !== "undefined") shippingRate.price = price;
      if (typeof unit !== "undefined") shippingRate.unit = unit;
      if (typeof extraPrice !== "undefined") shippingRate.extraPrice = extraPrice;
      
      await shippingRate.save();
      
      // Fetch updated shipping rate with includes
      const updatedShippingRate = await db.ShippingRate.findByPk(shippingRate.id, {
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime']
          }
        ]
      });
      
      resolve({ success: true, data: updatedShippingRate });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete shipping rate
const deleteShippingRate = async (shippingRateId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shippingRate = await db.ShippingRate.findByPk(shippingRateId);
      if (!shippingRate) {
        resolve({ success: false, message: "Không tìm thấy bảng giá vận chuyển" });
        return;
      }
      
      await shippingRate.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

// Calculate shipping cost
const calculateShippingCost = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { serviceTypeId, regionId, weight, distance } = params;
      
      if (!serviceTypeId || !regionId || !weight || weight <= 0) {
        resolve({ success: false, message: "Thông tin không hợp lệ" });
        return;
      }
      
      // Find applicable shipping rate
      const shippingRate = await db.ShippingRate.findOne({
        where: {
          serviceTypeId,
          regionType: regionId,
          weightFrom: { [db.Sequelize.Op.lte]: weight },
          [db.Sequelize.Op.or]: [
            { weightTo: { [db.Sequelize.Op.gte]: weight } },
            { weightTo: null }
          ]
        },
        order: [['weightFrom', 'DESC']]
      });
      
      if (!shippingRate) {
        resolve({ success: false, message: "Không tìm thấy bảng giá phù hợp" });
        return;
      }
      
      let cost = parseFloat(shippingRate.price);
      
      // Calculate extra cost if weight exceeds weightFrom and weightTo is null
      if (shippingRate.weightTo === null && weight > shippingRate.weightFrom && shippingRate.extraPrice) {
        const extraWeight = weight - shippingRate.weightFrom;
        const extraUnits = Math.ceil(extraWeight / shippingRate.unit);
        cost += extraUnits * parseFloat(shippingRate.extraPrice);
      }
      
      resolve({
        success: true,
        data: {
          cost: Math.round(cost),
          shippingRate: shippingRate,
          calculation: {
            basePrice: parseFloat(shippingRate.price),
            extraWeight: shippingRate.weightTo === null && weight > shippingRate.weightFrom ? weight - shippingRate.weightFrom : 0,
            extraUnits: shippingRate.weightTo === null && weight > shippingRate.weightFrom ? Math.ceil((weight - shippingRate.weightFrom) / shippingRate.unit) : 0,
            extraCost: shippingRate.weightTo === null && weight > shippingRate.weightFrom ? Math.ceil((weight - shippingRate.weightFrom) / shippingRate.unit) * parseFloat(shippingRate.extraPrice) : 0
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get public shipping rates
const getPublicShippingRates = async (serviceTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const where = {};
      if (serviceTypeId) {
        where.serviceTypeId = serviceTypeId;
      }

      const shippingRates = await db.ShippingRate.findAll({
        where,
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime'],
            where: { status: 'Active' }
          }
        ],
        order: [['serviceTypeId', 'ASC'], ['regionType', 'ASC'], ['weightFrom', 'ASC']]
      });

      resolve({
        success: true,
        data: shippingRates
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listShippingRates,
  getShippingRateById,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
  calculateShippingCost,
  getPublicShippingRates
};
