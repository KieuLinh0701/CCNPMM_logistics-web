import db from '../models/index.js';

// List employees with pagination and search
const listEmployees = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "", officeId, status, shift } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (officeId) {
        where.officeId = officeId;
      }
      
      if (status) {
        where.status = status;
      }
      
      if (shift) {
        where.shift = shift;
      }
      
      const { rows, count } = await db.Employee.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role'],
            where: search ? {
              [db.Sequelize.Op.or]: [
                { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { email: { [db.Sequelize.Op.like]: `%${search}%` } },
                { phoneNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
              ]
            } : undefined
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
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

// Get employee by ID
const getEmployeeById = async (employeeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const employee = await db.Employee.findByPk(employeeId, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'isActive']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type', 'status']
          }
        ]
      });
      
      if (!employee) {
        resolve({ success: false, message: "Không tìm thấy nhân viên" });
        return;
      }
      resolve({ success: true, data: employee });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new employee
const createEmployee = async (employeeData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId, officeId, shift = "Full Day", status = "Inactive" } = employeeData;
      
      if (!userId || !officeId) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      // Check if user exists and has appropriate role
      const user = await db.User.findByPk(userId);
      if (!user) {
        resolve({ success: false, message: "Không tìm thấy người dùng" });
        return;
      }
      
      if (!['manager', 'driver', 'shipper'].includes(user.role)) {
        resolve({ success: false, message: "Người dùng không có quyền làm nhân viên" });
        return;
      }
      
      // Check if office exists
      const office = await db.Office.findByPk(officeId);
      if (!office) {
        resolve({ success: false, message: "Không tìm thấy văn phòng" });
        return;
      }
      
      // Check if user is already an employee
      const existingEmployee = await db.Employee.findOne({ where: { userId } });
      if (existingEmployee) {
        resolve({ success: false, message: "Người dùng đã là nhân viên" });
        return;
      }
      
      const created = await db.Employee.create({ 
        userId, officeId, shift, status
      });
      
      // Fetch the created employee with includes
      const newEmployee = await db.Employee.findByPk(created.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });
      
      resolve({ success: true, data: newEmployee });
    } catch (error) {
      reject(error);
    }
  });
};

// Update employee
const updateEmployee = async (employeeId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { officeId, shift, status } = updateData;
      
      const employee = await db.Employee.findByPk(employeeId);
      if (!employee) {
        resolve({ success: false, message: "Không tìm thấy nhân viên" });
        return;
      }
      
      // Check if new office exists
      if (officeId && officeId !== employee.officeId) {
        const office = await db.Office.findByPk(officeId);
        if (!office) {
          resolve({ success: false, message: "Không tìm thấy văn phòng" });
          return;
        }
      }
      
      // Update fields
      if (typeof officeId !== "undefined") employee.officeId = officeId;
      if (typeof shift !== "undefined") employee.shift = shift;
      if (typeof status !== "undefined") employee.status = status;
      
      await employee.save();
      
      // Fetch updated employee with includes
      const updatedEmployee = await db.Employee.findByPk(employee.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address', 'type']
          }
        ]
      });
      
      resolve({ success: true, data: updatedEmployee });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete employee
const deleteEmployee = async (employeeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const employee = await db.Employee.findByPk(employeeId);
      if (!employee) {
        resolve({ success: false, message: "Không tìm thấy nhân viên" });
        return;
      }
      
      await employee.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
