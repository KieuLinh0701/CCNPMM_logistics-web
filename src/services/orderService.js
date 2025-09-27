import db from '../models/index.js';

const orderService = {
  async listOrders(params) {
    try {
      const { page = 1, limit = 20, search = "", status, fromOfficeId, toOfficeId, userId, serviceTypeId } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};

      if (search) {
        where[db.Sequelize.Op.or] = [
          { trackingNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
          { senderName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { senderPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }
      if (status) where.status = status;
      if (fromOfficeId) where.fromOfficeId = fromOfficeId;
      if (toOfficeId) where.toOfficeId = toOfficeId;
      if (userId) where.userId = userId;
      if (serviceTypeId) where.serviceTypeId = serviceTypeId;

      const { rows, count } = await db.Order.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          { model: db.User, as: 'user', attributes: ['id','firstName','lastName','email','phoneNumber'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id','name','address','type'] },
          { model: db.Office, as: 'toOffice', attributes: ['id','name','address','type'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id','name','deliveryTime'] },
          { model: db.Product, as: 'products', attributes: ['id','name','weight','type'], through: { attributes: ['quantity'] } }
        ]
      });

      return { success: true, data: rows, pagination: { page: Number(page), limit: Number(limit), total: count } };
    } catch (error) {
      return { success: false, message: "Lỗi server khi lấy danh sách đơn hàng" };
    }
  },

  async getOrderById(orderId) {
    try {
      const order = await db.Order.findByPk(orderId, {
        include: [
          { model: db.User, as: 'user', attributes: ['id','firstName','lastName','email','phoneNumber','role'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id','name','address','phoneNumber','type','status'] },
          { model: db.Office, as: 'toOffice', attributes: ['id','name','address','phoneNumber','type','status'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id','name','deliveryTime','status'] },
          { model: db.Product, as: 'products', attributes: ['id','name','weight','type','status'], through: { attributes: ['quantity'] } },
          { model: db.OrderHistory, as: 'histories', attributes: ['id','status','notes','createdAt'], order: [['createdAt','DESC']] }
        ]
      });

      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };
      return { success: true, data: order };
    } catch (error) {
      return { success: false, message: "Lỗi server khi lấy chi tiết đơn hàng" };
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };

      order.status = status;
      await order.save();
      return { success: true, data: order };
    } catch (error) {
      return { success: false, message: "Lỗi server khi cập nhật trạng thái" };
    }
  },

  async deleteOrder(orderId) {
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) return { success: false, message: "Không tìm thấy đơn hàng" };

      await order.destroy();
      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi server khi xóa đơn hàng" };
    }
  },

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

export default orderService;
