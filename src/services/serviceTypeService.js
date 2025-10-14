import db from '../models/index.js';

const serviceTypeService = {
  async listServiceTypes(params) {
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
        order: [["createdAt", "DESC"]],
      });

      return {
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count },
      };
    } catch (error) {
      return { success: false, message: "Lỗi server khi lấy danh sách" };
    }
  },

  async getServiceTypeById(serviceTypeId) {
    try {
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        return { success: false, message: "Không tìm thấy loại dịch vụ" };
      }
      return { success: true, data: serviceType };
    } catch (error) {
      return { success: false, message: "Lỗi server khi lấy chi tiết" };
    }
  },

  async createServiceType(serviceTypeData) {
    try {
      const { name, deliveryTime, status = "active" } = serviceTypeData;
      if (!name) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
      }
      const created = await db.ServiceType.create({ name, deliveryTime, status });
      return { success: true, data: created };
    } catch (error) {
      return { success: false, message: "Lỗi server khi tạo mới" };
    }
  },

  async updateServiceType(serviceTypeId, updateData) {
    try {
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        return { success: false, message: "Không tìm thấy loại dịch vụ" };
      }

      const { name, deliveryTime, status } = updateData;
      if (typeof name !== "undefined") serviceType.name = name;
      if (typeof deliveryTime !== "undefined") serviceType.deliveryTime = deliveryTime;
      if (typeof status !== "undefined") serviceType.status = status;

      await serviceType.save();
      return { success: true, data: serviceType };
    } catch (error) {
      return { success: false, message: "Lỗi server khi cập nhật" };
    }
  },

  async deleteServiceType(serviceTypeId) {
    try {
      const serviceType = await db.ServiceType.findByPk(serviceTypeId);
      if (!serviceType) {
        return { success: false, message: "Không tìm thấy loại dịch vụ" };
      }
      await serviceType.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi server khi xóa" };
    }
  },

  async getActiveServiceTypes() {
    try {
      const serviceTypes = await db.ServiceType.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name', 'deliveryTime', 'status'],
        order: [['name', 'ASC']],
      });

      return {
        success: true,
        message: 'Lấy danh sách dịch vụ vận chuyển thành công',
        serviceTypes,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi server khi lấy danh sách dịch vụ vận chuyển',
        serviceTypes: [],
      };
    }
  },
};

export default serviceTypeService;
