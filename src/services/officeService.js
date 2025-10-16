import db from '../models/index.js';

const officeService = {
  // List offices with pagination and search
  async listOffices(params) {
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

      if (type) where.type = type;
      if (status) where.status = status;

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

      return {
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get office by ID
  async getOfficeById(officeId) {
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
        return { success: false, message: "Không tìm thấy văn phòng" };
      }
      return { success: true, data: office };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create new office
  async createOffice(officeData) {
    try {
      const {
        code, name, address, codeWard, codeCity, latitude, longitude,
        email, phoneNumber, openingTime, closingTime,
        type = "Post Office", status = "Active"
      } = officeData;

      if (!code || !name || !address || !codeWard || !codeCity || !latitude || !longitude || !email || !phoneNumber) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
      }

      // Check unique constraints
      const existsCode = await db.Office.findOne({ where: { code } });
      if (existsCode) return { success: false, message: "Mã văn phòng đã tồn tại" };

      const existsName = await db.Office.findOne({ where: { name } });
      if (existsName) return { success: false, message: "Tên văn phòng đã tồn tại" };

      const existsPhone = await db.Office.findOne({ where: { phoneNumber } });
      if (existsPhone) return { success: false, message: "Số điện thoại đã tồn tại" };

      const created = await db.Office.create({
        code, name, address, codeWard, codeCity, latitude, longitude,
        email, phoneNumber, openingTime, closingTime, type, status
      });

      return { success: true, data: created };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update office (admin update)
  async updateOffice(officeId, updateData) {
    try {
      const {
        code, name, address, codeWard, codeCity, latitude, longitude,
        email, phoneNumber, openingTime, closingTime, type, status
      } = updateData;

      const office = await db.Office.findByPk(officeId);
      if (!office) return { success: false, message: "Không tìm thấy văn phòng" };

      // Unique checks
      if (code && code !== office.code) {
        const existsCode = await db.Office.findOne({ where: { code } });
        if (existsCode) return { success: false, message: "Mã văn phòng đã tồn tại" };
      }

      if (name && name !== office.name) {
        const existsName = await db.Office.findOne({ where: { name } });
        if (existsName) return { success: false, message: "Tên văn phòng đã tồn tại" };
      }

      if (phoneNumber && phoneNumber !== office.phoneNumber) {
        const existsPhone = await db.Office.findOne({ where: { phoneNumber } });
        if (existsPhone) return { success: false, message: "Số điện thoại đã tồn tại" };
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
      return { success: true, data: office };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete office
  async deleteOffice(officeId) {
    try {
      const office = await db.Office.findByPk(officeId);
      if (!office) return { success: false, message: "Không tìm thấy văn phòng" };

      const employeeCount = await db.Employee.count({ where: { officeId } });
      if (employeeCount > 0) {
        return { success: false, message: "Không thể xóa văn phòng có nhân viên" };
      }

      await office.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get Office By UserId
  async getByUserId(userId) {
    try {
      const employee = await db.Employee.findOne({ where: { userId }, include: [{ model: db.Office, as: 'office' }] });
      if (!employee || !employee.office) {
        return {
          success: false,
          message: 'Không tìm thấy bưu cục'
        };
      }

      return {
        success: true,
        message: 'Lấy thông tin bưu cục thành công',
        office: employee.office
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Lỗi server'
      };
    }
  },

  // Update Office by user
  async update(userId, officeId, data) {
    try {
      // Lấy office theo employee
      const employee = await db.Employee.findOne({ where: { userId }, include: [{ model: db.Office, as: 'office' }] });
      const office = employee?.office;

      if (!office || office.id !== Number(officeId)) {
        return { success: false, message: 'Office không tồn tại hoặc không có quyền cập nhật' };
      }

      await office.update(data);

      return { success: true, office };
    } catch (error) {
      console.error('Update office error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  async getOfficesByArea(codeCity, codeWard) {
    console.log("codeWard ", codeWard);
    try {
      const whereClause = { status: 'Active' };
      if (codeCity != null) whereClause.codeCity = codeCity;
      if (codeWard != null) whereClause.codeWard = codeWard;

      let offices = await db.Office.findAll({ where: whereClause });

      if ((!offices || offices.length === 0) && codeCity != null) {
        offices = await db.Office.findAll({
          where: { codeCity },
        });
      }

      if (!offices || offices.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy bưu cục trong khu vực này",
          offices: [],
        };
      }

      return {
        success: true,
        message: "Lấy thông tin bưu cục thành công",
        offices,
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi server",
        offices: [],
      };
    }
  },

  // Public methods for guests
  async searchOffices(params) {
    try {
      const { city, ward, search } = params;
      const where = { status: 'Active' };

      if (city) where.codeCity = city;
      if (ward) where.codeWard = ward;
      if (search) {
        where[db.Sequelize.Op.or] = [
          { name: { [db.Sequelize.Op.like]: `%${search}%` } },
          { address: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
      }

      const offices = await db.Office.findAll({
        where,
        attributes: ['id', 'name', 'address', 'phoneNumber', 'email', 'openingTime', 'closingTime', 'type', 'latitude', 'longitude'],
        order: [['name', 'ASC']]
      });

      return { success: true, data: offices };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  async getPublicOffices(params) {
    try {
      const { page = 1, limit = 20, city } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = { status: 'Active' };

      if (city) where.codeCity = city;

      const { rows, count } = await db.Office.findAndCountAll({
        where,
        attributes: ['id', 'name', 'address', 'phoneNumber', 'email', 'openingTime', 'closingTime', 'type', 'latitude', 'longitude'],
        limit: Number(limit),
        offset,
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default officeService;
