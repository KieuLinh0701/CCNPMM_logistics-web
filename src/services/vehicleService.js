import { VEHICLE_STATUSES, VEHICLE_STATUSES_UPDATE, VEHICLE_TYPES } from '../config/vehicleConfig';
import db from '../models';

const vehicleService = {
  // Get Types Enum
  async getTypesEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum type từ model Employee
      const typesEnum = db.Vehicle.rawAttributes.type.values;

      return {
        success: true,
        message: 'Lấy danh sách loại phương tiện thành công',
        types: typesEnum,
      };
    } catch (error) {
      console.error('Get Types Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Status Enum
  async getStatusesEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum shift từ model Employee
      const statusesEnum = db.Vehicle.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh trạng thái phương tiện thành công',
        statuses: statusesEnum,
      };
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Vehicles By Office
  async getVehiclesByOffice(userId, officeId, page, limit, filters) {
    try {
      const { Op } = db.Sequelize;

      // Kiểm tra user
      const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role']
      });

      if (!user) return { success: false, message: 'Người dùng không tồn tại' };
      if (user.role === "user")
        return { success: false, message: 'Người dùng không có quyền lấy phương tiện' };

      // Kiểm tra office
      if (!officeId)
        return { success: false, message: 'officeId là bắt buộc' };

      const office = await db.Office.findByPk(officeId);
      if (!office)
        return { success: false, message: 'Chi nhánh không tồn tại' };

      // Điều kiện where (có filters)
      const { searchText, type, status, startDate, endDate, sort } = filters || {};
      const whereCondition = { officeId };

      if (searchText)
        whereCondition.licensePlate = { [Op.like]: `%${searchText}%` };

      if (type && type !== 'All')
        whereCondition.type = type;

      if (status && status !== 'All')
        whereCondition.status = status;

      if (startDate && endDate)
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };

      // Sắp xếp
      let order = [['createdAt', 'DESC']];
      if (sort && sort !== 'none') {
        switch (sort) {
          case 'newest': order = [['createdAt', 'DESC']]; break;
          case 'oldest': order = [['createdAt', 'ASC']]; break;
          case 'capacityHigh': order = [['capacity', 'DESC']]; break;
          case 'capacityLow': order = [['capacity', 'ASC']]; break;
        }
      }

      // Query 1: Lấy danh sách xe theo bộ lọc
      const vehiclesResult = await db.Vehicle.findAndCountAll({
        where: whereCondition,
        order,
        limit,
        offset: (page - 1) * limit,
        include: [{
          model: db.Office,
          as: 'office',
          attributes: ['id', 'name']
        }]
      });

      // Query 2: Đếm số lượng xe theo trạng thái (KHÔNG dùng filters)
      const statusCountsRaw = await db.Vehicle.findAll({
        where: { officeId },
        attributes: [
          'status',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('status')), 'total']
        ],
        group: ['status'],
        raw: true
      });

      // Đảm bảo luôn trả đủ các trạng thái (nếu một trạng thái không có, thêm vào với 0)
      const allStatuses = ['Available', 'InUse', 'Maintenance', 'Archived'];
      const statusCounts = allStatuses.map(status => {
        const found = statusCountsRaw.find(s => s.status === status);
        return {
          status,
          total: found ? parseInt(found.total, 10) : 0
        };
      });

      // Trả về kết quả
      return {
        success: true,
        message: 'Lấy danh sách phương tiện theo chi nhánh thành công',
        vehicles: vehiclesResult.rows,
        total: vehiclesResult.count,
        page,
        limit,
        statusCounts 
      };

    } catch (error) {
      console.error('getVehiclesByOffice error:', error);
      return { success: false, message: 'Lỗi server', error: error.message };
    }
  },

  // Add Vehicle
  async addVehicle(userId, officeId, licensePlate, type, capacity, description) {
    const t = await db.sequelize.transaction();
    try {
      // Kiểm tra thông tin bắt buộc
      if (!licensePlate || licensePlate.trim().length === 0) {
        return { success: false, message: "Biển số xe không được để trống" };
      }
      if (!type || !Object.values(VEHICLE_TYPES).includes(type)) {
        return { success: false, message: "Loại xe không hợp lệ" };
      }
      const capacityNum = parseFloat(capacity);
      if (!capacity || isNaN(capacityNum) || capacityNum <= 0) {
        return { success: false, message: "Tải trọng phải là số lớn hơn 0" };
      }

      // Kiểm tra user có tồn tại không
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{
          model: db.Employee,
          as: 'employee',
          // BỎ where condition ở đây vì admin không có employee
        }]
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      console.log("user", user);

      // Kiểm tra role
      const allowedRoles = ['manager', 'admin'];
      if (!allowedRoles.includes(user.role)) {
        return { success: false, message: 'Chỉ Manager hoặc Admin mới có quyền thêm phương tiện' };
      }

      // Nếu là manager, kiểm tra có thuộc office này không
      if (user.role === 'manager') {
        if (!user.employee || user.employee.officeId !== parseInt(officeId)) {
          return { success: false, message: 'Manager không thuộc về chi nhánh này' };
        }
      }

      // Kiểm tra employee record có khớp với office không
      if (!user.employee || user.employee.officeId !== parseInt(officeId)) {
        return { success: false, message: 'Manager không thuộc về chi nhánh này' };
      }

      // Kiểm tra biển số xe đã tồn tại chưa
      const existingVehicle = await db.Vehicle.findOne({
        where: { licensePlate: licensePlate.trim() }
      });

      if (existingVehicle) {
        return { success: false, message: 'Biển số xe đã tồn tại' };
      }

      // Kiểm tra office có tồn tại không
      const office = await db.Office.findOne({ where: { id: officeId } });
      if (!office) {
        return { success: false, message: 'Chi nhánh không tồn tại' };
      }

      // Tạo vehicle mới
      const newVehicle = await db.Vehicle.create({
        licensePlate: licensePlate.trim(),
        type: type,
        capacity: parseFloat(capacity),
        status: VEHICLE_STATUSES.AVAILABLE,
        description: description ? description.trim() : null,
        officeId: parseInt(officeId)
      }, { transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Thêm phương tiện thành công",
        vehicle: newVehicle,
      };
    } catch (error) {
      await t.rollback();
      console.error("Add Vehicle error:", error);
      return { success: false, message: "Lỗi server khi thêm phương tiện" };
    }
  },

  // Update Vehicle
  async updateUserVehicle(userId, vehicleId, licensePlate, type, capacity, status, description) {
    console.log("hi")
    const t = await db.sequelize.transaction();
    try {
      // Kiểm tra vehicle có tồn tại không
      const existingVehicle = await db.Vehicle.findOne({
        where: { id: vehicleId },
        include: [{
          model: db.Office,
          as: 'office'
        }]
      });

      if (!existingVehicle) {
        return { success: false, message: 'Phương tiện không tồn tại' };
      }

      // Kiểm tra user có tồn tại không
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{
          model: db.Employee,
          as: 'employee'
        }]
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Kiểm tra quyền
      const allowedRoles = ['manager', 'admin'];
      if (!allowedRoles.includes(user.role)) {
        return { success: false, message: 'Chỉ Manager hoặc Admin mới có quyền cập nhật phương tiện' };
      }

      // Nếu là manager, kiểm tra có thuộc office này không
      if (user.role === 'manager') {
        if (!user.employee || user.employee.officeId !== existingVehicle.officeId) {
          return { success: false, message: 'Manager không thuộc về chi nhánh này' };
        }
      }

      // Validation cho các trường được cập nhật
      if (licensePlate !== undefined) {
        if (!licensePlate || licensePlate.trim().length === 0) {
          return { success: false, message: "Biển số xe không được để trống" };
        }

        // Kiểm tra biển số xe đã tồn tại chưa (trừ chính nó)
        const duplicateLicense = await db.Vehicle.findOne({
          where: {
            licensePlate: licensePlate.trim(),
            id: { [db.Sequelize.Op.ne]: vehicleId }
          }
        });

        if (duplicateLicense) {
          return { success: false, message: 'Biển số xe đã tồn tại' };
        }
      }

      if (type !== undefined && !Object.values(VEHICLE_TYPES).includes(type)) {
        return { success: false, message: "Loại xe không hợp lệ" };
      }

      if (status !== undefined && !Object.values(VEHICLE_STATUSES_UPDATE).includes(status)) {
        return { success: false, message: "Trạng thái xe không hợp lệ" };
      }

      const capacityNum = parseFloat(capacity);
      console.log("capacityNum", capacityNum);
      if (!capacity || isNaN(capacityNum) || capacityNum <= 0) {
        return { success: false, message: "Tải trọng phải là số lớn hơn 0" };
      }

      // Tạo object update, chỉ bao gồm các trường có giá trị và khác giá trị cũ
      const updateFields = {};

      if (licensePlate !== undefined && licensePlate.trim() !== existingVehicle.licensePlate) {
        updateFields.licensePlate = licensePlate.trim();
      }

      if (type !== undefined && type !== existingVehicle.type) {
        updateFields.type = type;
      }

      if (capacity !== undefined && parseFloat(capacity) !== parseFloat(existingVehicle.capacity)) {
        updateFields.capacity = parseFloat(capacity);
      }

      if (status !== undefined && status !== existingVehicle.status) {
        updateFields.status = status;
      }

      if (description !== undefined) {
        const newDescription = description ? description.trim() : null;
        const oldDescription = existingVehicle.description ? existingVehicle.description.trim() : null;
        if (newDescription !== oldDescription) {
          updateFields.description = newDescription;
        }
      }

      // Nếu không có trường nào để update
      if (Object.keys(updateFields).length === 0) {
        return { success: false, message: "Không có dữ liệu nào để cập nhật" };
      }

      // Thực hiện update
      const [affectedCount] = await db.Vehicle.update(
        updateFields,
        {
          where: { id: vehicleId },
          transaction: t
        }
      );

      if (affectedCount === 0) {
        await t.rollback();
        return { success: false, message: "Cập nhật phương tiện thất bại" };
      }

      await t.commit();

      // Lấy lại thông tin vehicle sau khi update
      const updatedVehicle = await db.Vehicle.findByPk(vehicleId);

      return {
        success: true,
        message: "Cập nhật phương tiện thành công",
        vehicle: updatedVehicle,
      };
    } catch (error) {
      await t.rollback();
      console.error("Update Vehicle error:", error);
      return { success: false, message: "Lỗi server khi cập nhật phương tiện" };
    }
  },

  // Import Vehicles
  async importVehicles(userId, officeId, vehicles) {
    const importedResults = [];
    const t = await db.sequelize.transaction();

    try {
      // Kiểm tra user
      const user = await db.User.findOne({
        where: { id: userId },
        include: [{
          model: db.Employee,
          as: 'employee'
        }]
      });

      if (!user) {
        await t.rollback();
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // Kiểm tra quyền
      const allowedRoles = ['manager', 'admin'];
      if (!allowedRoles.includes(user.role)) {
        await t.rollback();
        return { success: false, message: 'Chỉ Manager hoặc Admin mới có quyền import phương tiện' };
      }

      // Kiểm tra office có tồn tại không
      const office = await db.Office.findOne({ where: { id: officeId } });
      if (!office) {
        await t.rollback();
        return { success: false, message: 'Chi nhánh không tồn tại' };
      }

      // Nếu là manager, kiểm tra có thuộc office này không
      if (user.role === 'manager') {
        if (!user.employee || user.employee.officeId !== parseInt(officeId)) {
          await t.rollback();
          return { success: false, message: 'Manager không thuộc về chi nhánh này nên không có quyền import phương tiện' };
        }
      }

      // Kiểm tra các biển số xe trùng lặp trong danh sách import
      const licensePlates = vehicles.map(v => v.licensePlate?.trim().toUpperCase());
      const duplicateInImport = licensePlates.filter((plate, index) => licensePlates.indexOf(plate) !== index);

      if (duplicateInImport.length > 0) {
        await t.rollback();
        return {
          success: false,
          message: `Có biển số xe trùng lặp trong file import: ${[...new Set(duplicateInImport)].join(', ')}`
        };
      }

      // Kiểm tra các biển số xe đã tồn tại trong database
      const existingVehicles = await db.Vehicle.findAll({
        where: {
          licensePlate: {
            [db.Sequelize.Op.in]: licensePlates
          }
        },
        attributes: ['licensePlate']
      });

      const existingLicensePlates = existingVehicles.map(v => v.licensePlate);

      for (const vehicleData of vehicles) {
        const { licensePlate, type, capacity, description } = vehicleData;

        // Validate dữ liệu bắt buộc
        const missingFields = [];
        if (!licensePlate || licensePlate.trim().length === 0) missingFields.push("biển số xe");
        if (!type) missingFields.push("loại xe");
        if (!capacity) missingFields.push("tải trọng");

        if (missingFields.length > 0) {
          importedResults.push({
            licensePlate: licensePlate || "(Chưa có biển số)",
            success: false,
            message: `Thiếu thông tin: ${missingFields.join(", ")}`
          });
          continue;
        }

        // Kiểm tra loại xe hợp lệ
        if (!Object.values(VEHICLE_TYPES).includes(type)) {
          importedResults.push({
            licensePlate,
            success: false,
            message: `Loại xe không hợp lệ: ${type}`
          });
          continue;
        }

        // Kiểm tra tải trọng hợp lệ
        const capacityNum = parseFloat(capacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
          importedResults.push({
            licensePlate,
            success: false,
            message: "Tải trọng phải là số lớn hơn 0"
          });
          continue;
        }

        // Kiểm tra biển số đã tồn tại
        const trimmedLicensePlate = licensePlate.trim().toUpperCase();
        if (existingLicensePlates.includes(trimmedLicensePlate)) {
          importedResults.push({
            licensePlate,
            success: false,
            message: "Biển số xe đã tồn tại trong hệ thống"
          });
          continue;
        }

        try {
          // Tạo phương tiện mới
          const newVehicle = await db.Vehicle.create(
            {
              licensePlate: trimmedLicensePlate,
              type: type,
              capacity: capacityNum,
              status: VEHICLE_STATUSES.AVAILABLE,
              description: description ? description.trim() : null,
              officeId: parseInt(officeId),
              createdAt: new Date(),
              updatedAt: new Date()
            },
            { transaction: t }
          );

          importedResults.push({
            licensePlate,
            success: true,
            message: "Thêm phương tiện thành công",
            vehicle: newVehicle,
          });
        } catch (err) {
          console.error(`Import vehicle "${licensePlate}" error:`, err);
          importedResults.push({
            licensePlate,
            success: false,
            message: "Lỗi server khi thêm phương tiện",
          });
        }
      }

      const hasSuccessfulImports = importedResults.some(r => r.success);
      if (hasSuccessfulImports) {
        await t.commit();
      } else {
        await t.rollback();
      }

      const totalImported = importedResults.filter(r => r.success).length;
      const totalFailed = importedResults.filter(r => !r.success).length;

      return {
        success: true,
        message: `Import hoàn tất: ${totalImported} phương tiện thành công, ${totalFailed} lỗi`, // Sửa biến đúng
        totalImported: totalImported,
        totalFailed: totalFailed,
        results: importedResults,
      };
    } catch (error) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
      console.error("Import Vehicles error:", error);
      return { success: false, message: "Lỗi server khi import phương tiện" };
    }
  },

  // Admin
  // List vehicles
  async listVehicles(params) {
    try {
      const { page = 1, limit = 20, search = "", type, status } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};

      if (search) {
        where[db.Sequelize.Op.or] = [
          { licensePlate: { [db.Sequelize.Op.like]: `%${search}%` } },
          { description: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }

      if (type) where.type = type;
      if (status) where.status = status;

      const { rows, count } = await db.Vehicle.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address'],
            required: false
          },
          {
            model: db.Shipment,
            as: 'shipments',
            attributes: ['id', 'status'],
            required: false
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

  // Get vehicle by ID
  async getVehicleById(vehicleId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId, {
        include: [
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address'],
            required: false
          },
          {
            model: db.Shipment,
            as: 'shipments',
            attributes: ['id', 'status', 'createdAt'],
            required: false
          }
        ]
      });

      if (!vehicle) {
        return { success: false, message: "Không tìm thấy phương tiện" };
      }
      return { success: true, data: vehicle };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create vehicle
  async createVehicle(vehicleData) {
    try {
      const {
        licensePlate,
        type = "Truck",
        capacity,
        status = "Available",
        description
      } = vehicleData;

      if (!licensePlate || !capacity) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
      }

      // Check if license plate already exists
      const exists = await db.Vehicle.findOne({ where: { licensePlate } });
      if (exists) {
        return { success: false, message: "Biển số xe đã tồn tại" };
      }

      // Validate capacity
      if (capacity <= 0) {
        return { success: false, message: "Tải trọng phải lớn hơn 0" };
      }

      const created = await db.Vehicle.create({
        licensePlate,
        type,
        capacity,
        status,
        description
      });

      return { success: true, data: created };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update vehicle
  async updateVehicle(vehicleId, updateData) {
    try {
      const { licensePlate, type, capacity, status, description } = updateData;

      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        return { success: false, message: "Không tìm thấy phương tiện" };
      }

      // Check if new license plate already exists (if changed)
      if (licensePlate && licensePlate !== vehicle.licensePlate) {
        const exists = await db.Vehicle.findOne({ where: { licensePlate } });
        if (exists) {
          return { success: false, message: "Biển số xe đã tồn tại" };
        }
      }

      // Validate capacity if provided
      if (capacity !== undefined && capacity <= 0) {
        return { success: false, message: "Tải trọng phải lớn hơn 0" };
      }

      // Update fields
      if (typeof licensePlate !== "undefined") vehicle.licensePlate = licensePlate;
      if (typeof type !== "undefined") vehicle.type = type;
      if (typeof capacity !== "undefined") vehicle.capacity = capacity;
      if (typeof status !== "undefined") vehicle.status = status;
      if (typeof description !== "undefined") vehicle.description = description;

      await vehicle.save();

      return { success: true, data: vehicle };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete vehicle
  async deleteVehicle(vehicleId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        return { success: false, message: "Không tìm thấy phương tiện" };
      }

      // Check if vehicle is in use
      if (vehicle.status === 'InUse') {
        return { success: false, message: "Không thể xóa phương tiện đang sử dụng" };
      }

      // Check if vehicle has shipments
      const shipmentCount = await db.Shipment.count({ where: { vehicleId } });
      if (shipmentCount > 0) {
        return { success: false, message: "Không thể xóa phương tiện đã có lịch sử vận chuyển" };
      }

      await vehicle.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get vehicle statistics
  async getVehicleStats() {
    try {
      const total = await db.Vehicle.count();
      const available = await db.Vehicle.count({ where: { status: 'Available' } });
      const inUse = await db.Vehicle.count({ where: { status: 'InUse' } });
      const maintenance = await db.Vehicle.count({ where: { status: 'Maintenance' } });

      return {
        success: true,
        data: {
          total,
          available,
          inUse,
          maintenance
        }
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default vehicleService;