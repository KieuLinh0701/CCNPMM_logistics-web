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

  // ================== LINH's FEATURES ==================
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
  
  // Get Active Service Types
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
      console.error(error);
      return {
        success: false,
        message: 'Lỗi server khi lấy danh sách dịch vụ vận chuyển',
        serviceTypes: [],
      };
    }
  },

  // CalculateShippingFee
  async calculateShippingFee({ weight, serviceTypeId, senderCodeCity, recipientCodeCity }) {
    try {
      // 1. Lấy vùng của người gửi & người nhận
      const senderRegion = await db.Region.findOne({
        where: { codeCity: Number(senderCodeCity) },
      });
      const recipientRegion = await db.Region.findOne({
        where: { codeCity: Number(recipientCodeCity) },
      });

      if (!senderRegion || !recipientRegion) {
        return {
          success: false,
          message: "Không tìm thấy thông tin vùng của người gửi hoặc người nhận",
        };
      }

      // 2. Xác định regionType
      let regionType = "";
      if (senderCodeCity === recipientCodeCity) {
        regionType = "Intra-city";
      } else if (senderRegion.regionName === recipientRegion.regionName) {
        regionType = "Intra-region";
      } else if (
        (senderRegion.regionName === "North" && recipientRegion.regionName === "Central") ||
        (senderRegion.regionName === "Central" && recipientRegion.regionName === "North") ||
        (senderRegion.regionName === "Central" && recipientRegion.regionName === "South") ||
        (senderRegion.regionName === "South" && recipientRegion.regionName === "Central")
      ) {
        regionType = "Near-region";
      } else {
        regionType = "Inter-region"; // Bắc - Nam
      }

      // 3. Lấy danh sách ShippingRate phù hợp
      const shippingRates = await db.ShippingRate.findAll({
        where: {
          serviceTypeId,
          regionType,
        },
        order: [["weightFrom", "ASC"]],
      });

      if (!shippingRates || shippingRates.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy bảng giá cho loại dịch vụ này",
        };
      }

      // 4. Chọn mức giá
      let selectedRate = null;
      for (const rate of shippingRates) {
        if (rate.weightTo) {
          if (weight > rate.weightFrom && weight <= rate.weightTo) {
            selectedRate = rate;
            break;
          }
        } else {
          if (weight > rate.weightFrom) {
            selectedRate = rate;
            break;
          }
        }
      }

      if (!selectedRate) {
        return {
          success: false,
          message: "Không tìm thấy mức giá phù hợp cho cân nặng",
        };
      }

      let shippingFee = Number(selectedRate.price);

      // Nếu weightTo = null => cộng thêm extraPrice
      if (!selectedRate.weightTo && selectedRate.extraPrice) {
        const extraWeight = weight - Number(selectedRate.weightFrom);
        const step = Number(selectedRate.unit) || 0.5;
        const extraSteps = Math.ceil(extraWeight / step);
        shippingFee += extraSteps * Number(selectedRate.extraPrice);
      }

      return {
        success: true,
        message: "Tính phí vận chuyển thành công",
        shippingFee,
      };
    } catch (error) {
      console.error("Calculate Shipping Fee error:", error);
      return {
        success: false,
        message: "Lỗi server khi tính phí vận chuyển",
      };
    }
  },
};

export default serviceTypeService;
