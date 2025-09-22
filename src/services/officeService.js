import db from '../models/index.js';

// List offices with pagination and search
const listOffices = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "", type, status } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (search) {
        where[db.Sequelize.Op.or] = [
          { name: { [db.Sequelize.Op.like]: `%${search}%` } },
          { address: { [db.Sequelize.Op.like]: `%${search}%` } },
          { phoneNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
          { email: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }
      
      if (type) {
        where.type = type;
      }
      
      if (status) {
        where.status = status;
      }
      
      const { rows, count } = await db.Office.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.Employee,
            as: 'employees',
            attributes: ['id', 'shift', 'status'],
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
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

// Get office by ID
const getOfficeById = async (officeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const office = await db.Office.findByPk(officeId, {
        include: [
          {
            model: db.Employee,
            as: 'employees',
            attributes: ['id', 'shift', 'status', 'hireDate'],
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
              }
            ]
          }
        ]
      });
      
      if (!office) {
        resolve({ success: false, message: "Không tìm thấy văn phòng" });
        return;
      }
      resolve({ success: true, data: office });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new office
const createOffice = async (officeData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { 
        code, name, address, codeWard, codeCity, latitude, longitude, 
        email, phoneNumber, openingTime, closingTime, type = "Post Office", status = "Active" 
      } = officeData;
      
      if (!code || !name || !address || !codeWard || !codeCity || !latitude || !longitude || !email || !phoneNumber) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      // Check if office code already exists
      const existsCode = await db.Office.findOne({ where: { code } });
      if (existsCode) {
        resolve({ success: false, message: "Mã văn phòng đã tồn tại" });
        return;
      }
      
      // Check if office name already exists
      const existsName = await db.Office.findOne({ where: { name } });
      if (existsName) {
        resolve({ success: false, message: "Tên văn phòng đã tồn tại" });
        return;
      }
      
      // Check if phone number already exists
      const existsPhone = await db.Office.findOne({ where: { phoneNumber } });
      if (existsPhone) {
        resolve({ success: false, message: "Số điện thoại đã tồn tại" });
        return;
      }
      
      const created = await db.Office.create({ 
        code, name, address, codeWard, codeCity, latitude, longitude,
        email, phoneNumber, openingTime, closingTime, type, status
      });
      
      resolve({ success: true, data: created });
    } catch (error) {
      reject(error);
    }
  });
};

// Update office
const updateOffice = async (officeId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { 
        code, name, address, codeWard, codeCity, latitude, longitude,
        email, phoneNumber, openingTime, closingTime, type, status
      } = updateData;
      
      const office = await db.Office.findByPk(officeId);
      if (!office) {
        resolve({ success: false, message: "Không tìm thấy văn phòng" });
        return;
      }
      
      // Check for conflicts if updating unique fields
      if (code && code !== office.code) {
        const existsCode = await db.Office.findOne({ where: { code } });
        if (existsCode) {
          resolve({ success: false, message: "Mã văn phòng đã tồn tại" });
          return;
        }
      }
      
      if (name && name !== office.name) {
        const existsName = await db.Office.findOne({ where: { name } });
        if (existsName) {
          resolve({ success: false, message: "Tên văn phòng đã tồn tại" });
          return;
        }
      }
      
      if (phoneNumber && phoneNumber !== office.phoneNumber) {
        const existsPhone = await db.Office.findOne({ where: { phoneNumber } });
        if (existsPhone) {
          resolve({ success: false, message: "Số điện thoại đã tồn tại" });
          return;
        }
      }
      
      // Update fields
      if (typeof code !== "undefined") office.code = code;
      if (typeof name !== "undefined") office.name = name;
      if (typeof address !== "undefined") office.address = address;
      if (typeof codeWard !== "undefined") office.codeWard = codeWard;
      if (typeof codeCity !== "undefined") office.codeCity = codeCity;
      if (typeof latitude !== "undefined") office.latitude = latitude;
      if (typeof longitude !== "undefined") office.longitude = longitude;
      if (typeof email !== "undefined") office.email = email;
      if (typeof phoneNumber !== "undefined") office.phoneNumber = phoneNumber;
      if (typeof openingTime !== "undefined") office.openingTime = openingTime;
      if (typeof closingTime !== "undefined") office.closingTime = closingTime;
      if (typeof type !== "undefined") office.type = type;
      if (typeof status !== "undefined") office.status = status;
      
      await office.save();
      resolve({ success: true, data: office });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete office
const deleteOffice = async (officeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const office = await db.Office.findByPk(officeId);
      if (!office) {
        resolve({ success: false, message: "Không tìm thấy văn phòng" });
        return;
      }
      
      // Check if office has employees
      const employeeCount = await db.Employee.count({ where: { officeId } });
      if (employeeCount > 0) {
        resolve({ success: false, message: "Không thể xóa văn phòng có nhân viên" });
        return;
      }
      
      await office.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice
};
