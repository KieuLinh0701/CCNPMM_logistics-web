import db from '../models/index.js';

const vehicleService = {
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

