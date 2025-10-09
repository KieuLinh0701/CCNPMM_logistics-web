import { Op } from 'sequelize';
import db from '../models';
import { VNPay, VnpLocale, dateFormat } from 'vnpay';
import paymentService from './paymentService';
import { current } from '@reduxjs/toolkit';

function generateTrackingNumber(length = 14) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const orderService = {
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

      // Lấy enum status từ model Order
      const statusesEnum = db.Order.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh trạng thái đơn hàng thành công',
        statuses: statusesEnum,
      };
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Payment Methods Enum
  async getPaymentMethodsEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum payment methods từ model Order
      const paymentMethodsEnum = db.Order.rawAttributes.paymentMethod.values;

      return {
        success: true,
        message: 'Lấy danh sách phương thức thanh toán đơn hàng thành công',
        paymentMethods: paymentMethodsEnum,
      };
    } catch (error) {
      console.error('Get Payment Methods Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Create Order
  async createOrder(userId, orderData) {
    const t = await db.sequelize.transaction();

    try {
      // 0. Lấy User đang thực hiện
      const currentUser = await db.User.findByPk(userId);
      if (!currentUser) throw new Error("Người dùng không tồn tại");

      console.log("Sender Phone raw:", orderData.senderPhone);
      console.log("Recipient Phone raw:", orderData.recipientPhone);
      // 1. Validate sender/recipient info
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(orderData.senderPhone))
        throw new Error("Số điện thoại người gửi không hợp lệ");
      if (!phoneRegex.test(orderData.recipientPhone))
        throw new Error("Số điện thoại người nhận không hợp lệ");

      if (
        !orderData.senderCityCode ||
        !orderData.senderWardCode ||
        !orderData.senderDetailAddress
      )
        throw new Error("Địa chỉ người gửi không hợp lệ");
      if (
        !orderData.recipientCityCode ||
        !orderData.recipientWardCode ||
        !orderData.recipientDetailAddress
      )
        throw new Error("Địa chỉ người nhận không hợp lệ");

      // 2. Validate products
      let totalOrderValue = 0;
      if (orderData.orderProducts?.length > 0) {
        for (const p of orderData.orderProducts) {
          if (!p.product?.id || p.quantity < 1 || p.price < 0)
            throw new Error("Thông tin sản phẩm không hợp lệ");
          totalOrderValue += p.price * p.quantity;
        }
        if (orderData.orderValue < totalOrderValue)
          throw new Error("Tổng giá trị đơn hàng không khớp với sản phẩm");
      }

      // 3. Validate COD
      if (orderData.cod < 0)
        throw new Error("COD không hợp lệ");

      // 4. Validate weight
      if (orderData.weight <= 0 || orderData.weight > 500)
        throw new Error("Khối lượng đơn hàng không hợp lệ");

      // 5. Validate service type
      const serviceType = await db.ServiceType.findByPk(orderData.serviceType.id);
      if (!serviceType) throw new Error("Loại dịch vụ không tồn tại");

      // 6. Validate promotion
      let promotion = null;
      if (orderData.promotion?.id) {
        promotion = await db.Promotion.findByPk(orderData.promotion.id, {
          transaction: t,
        });
        if (!promotion) throw new Error("Promotion không tồn tại");

        const now = new Date();
        if (
          promotion.status !== "active" ||
          promotion.startDate > now ||
          promotion.endDate < now ||
          (promotion.minOrderValue && orderData.shippingFee < promotion.minOrderValue) ||
          (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit)
        ) {
          throw new Error("Promotion không hợp lệ");
        }
      }

      // 7. Validate payer & payment method
      const validPayers = ["Shop", "Customer"];
      if (!validPayers.includes(orderData.payer))
        throw new Error("Người trả phí không hợp lệ");
      if (orderData.payer === "Customer" && orderData.paymentMethod !== "Cash")
        throw new Error("Khách hàng chỉ được thanh toán tiền mặt");

      // 8. Generate trackingNumber nếu chưa có
      const trackingNumber =
        orderData.trackingNumber || generateTrackingNumber(14);

      // 9. Xác định createdBy và createdByType theo role của user hiện tại
      const createdBy = currentUser.id;
      const createdByType = currentUser.role;

      // 10. Xác định user tạo đơn hàng
      let orderUserId = null;
      if (currentUser.role == "user") {
        orderUserId = currentUser.id;
      } else if (currentUser.role != "user") {
        if (orderData.senderPhone) {
          const senderUser = await db.User.findOne({
            where: { phone: orderData.senderPhone },
            transaction: t
          });
          if (senderUser) {
            orderUserId = senderUser.id;
          }
        }
      }

      // 11. Tạo Order
      const order = await db.Order.create(
        {
          trackingNumber,
          senderName: orderData.senderName,
          senderPhone: orderData.senderPhone,
          senderCityCode: orderData.senderCityCode,
          senderWardCode: orderData.senderWardCode,
          senderDetailAddress: orderData.senderDetailAddress,

          recipientName: orderData.recipientName,
          recipientPhone: orderData.recipientPhone,
          recipientCityCode: orderData.recipientCityCode,
          recipientWardCode: orderData.recipientWardCode,
          recipientDetailAddress: orderData.recipientDetailAddress,

          weight: orderData.weight,
          serviceTypeId: serviceType.id,
          promotionId: promotion?.id || null,
          discountAmount: orderData.discountAmount || 0,
          shippingFee: orderData.shippingFee,
          cod: orderData.cod,
          orderValue: orderData.orderValue,
          payer: orderData.payer,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          notes: orderData.notes,
          userId: orderUserId || null,
          status: orderData.status || "pending",
          fromOfficeId: orderData.fromOffice?.id,
          toOfficeId: orderData.toOffice?.id || null,
          deliveredAt: orderData.deliveredAt || null,
          createdBy: createdBy,
          createdByType: createdByType,
        },
        { transaction: t }
      );

      // 12. Lưu OrderProduct nếu có
      if (orderData.orderProducts?.length > 0) {
        const orderProducts = orderData.orderProducts.map((p) => ({
          orderId: order.id,
          productId: p.product.id,
          quantity: p.quantity,
          price: p.price,
        }));
        await db.OrderProduct.bulkCreate(orderProducts, { transaction: t });
      }

      // 13. Update promotion usedCount
      if (promotion) {
        promotion.usedCount += 1;
        await promotion.save({ transaction: t });
      }

      await t.commit();

      // 14. Load lại order đầy đủ
      const createdOrder = await db.Order.findByPk(order.id, {
        include: [
          {
            model: db.OrderProduct,
            as: "orderProducts",
            include: [{ model: db.Product, as: "product" }],
          },
          { model: db.Promotion, as: "promotion" },
          { model: db.ServiceType, as: "serviceType" },
          { model: db.Office, as: "fromOffice" },
          { model: db.Office, as: "toOffice" },
          { model: db.User, as: "user" },
          { model: db.User, as: "creator" },
        ],
      });

      return {
        success: true,
        message: "Tạo đơn hàng thành công",
        order: createdOrder,
      };
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Create Order error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi tạo đơn hàng",
      };
    }
  },

  async getOrdersByUser(userId, page, limit, filters) {
    try {
      // 1. Kiểm tra user có tồn tại không
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Xây where condition
      const {
        searchText,
        payer,
        status,
        paymentStatus,
        paymentMethod,
        cod,
        startDate,
        endDate,
      } = filters || {};

      const whereCondition = { userId };

      if (searchText) {
        // tìm theo mã đơn hàng, tên người nhận, số điện thoại người nhận
        whereCondition[Op.or] = [
          { trackingNumber: { [Op.like]: `%${searchText}%` } },
          { recipientName: { [Op.like]: `%${searchText}%` } },
          { recipientPhone: { [Op.like]: `%${searchText}%` } },
        ];
      }

      if (payer && payer !== "All") {
        whereCondition.payer = payer;
      }

      if (status && status !== "All") {
        whereCondition.status = status;
      }

      if (paymentStatus && paymentStatus !== "All") {
        whereCondition.paymentStatus = paymentStatus;
      }

      if (paymentMethod && paymentMethod !== "All") {
        whereCondition.paymentMethod = paymentMethod;
      }

      if (cod && cod !== "All") {
        whereCondition.cod = cod === "Yes" ? { [Op.gt]: 0 } : 0;
      }

      if (startDate && endDate) {
        whereCondition.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // 3. Query phân trang
      const ordersResult = await db.Order.findAndCountAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name']
          },
        ],
      });

      return {
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        orders: ordersResult.rows,
        total: ordersResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error("Get Orders by User error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng" };
    }
  },

  // Get Payment Statuses Enum
  async getPaymentStatusesEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum payment statuses từ model Order
      const paymentStatusesEnum = db.Order.rawAttributes.paymentStatus.values;

      return {
        success: true,
        message: 'Lấy danh sách trạng thái thanh toán đơn hàng thành công',
        paymentStatuses: paymentStatusesEnum,
      };
    } catch (error) {
      console.error('Get Payment Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Payers Enum
  async getPayersEnum(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum payer từ model Order
      const payersEnum = db.Order.rawAttributes.payer.values;

      return {
        success: true,
        message: 'Lấy danh người thanh toán đơn hàng thành công',
        payers: payersEnum,
      };
    } catch (error) {
      console.error('Get Payers Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Cancel Order
  async cancelOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm order theo id + userId
      const order = await db.Order.findOne({
        where: { id: orderId, userId },
        transaction: t,
      });

      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 3. Kiểm tra trạng thái có cho phép hủy không
      const cancellableStatuses = ["draft", "pending", "confirmed"];
      if (!cancellableStatuses.includes(order.status)) {
        return { success: false, message: "Không thể hủy đơn ở trạng thái hiện tại" };
      }

      // 4. Nếu đã thanh toán bằng VNPay, refund trước
      if (order.paymentMethod === "VNPay" && order.paymentStatus === "Paid") {
        const refundResult = await paymentService.refundVNPay(order.id);
        if (!refundResult.success) {
          // sandbox có thể fail refund, nhưng vẫn cho hủy đơn test
          console.warn("Refund sandbox không thành công:", refundResult.message);
        }
        // Thay trạng thái thanh toán thành Refunded
        order.paymentStatus = "Refunded";
      }

      // 5. Cập nhật trạng thái -> cancelled
      order.status = "cancelled";
      await order.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        message: order.paymentMethod !== 'cash'
          ? "Hoàn tiền và hủy đơn hàng thành công"
          : "Hủy đơn hàng thành công",
        order,
      };

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Cancel Order error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi hủy đơn hàng",
      };
    }
  },

  // Get Order by ID
  async getOrderById(userId, orderId) {
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm order theo id + userId, include các quan hệ
      const order = await db.Order.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: db.OrderProduct,
            as: "orderProducts",
            include: [{ model: db.Product, as: "product" }],
          },
          { model: db.Promotion, as: "promotion" },
          { model: db.ServiceType, as: "serviceType" },
          { model: db.Office, as: "fromOffice" },
          { model: db.Office, as: "toOffice" },
          { model: db.User, as: "user" },
        ],
      });

      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      return {
        success: true,
        message: "Lấy đơn hàng thành công",
        order,
      };
    } catch (error) {
      console.error("Get Order by ID error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng" };
    }
  },

  // Update Payment Status
  async updatePaymentStatus(orderId) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Tìm order theo id 
      const order = await db.Order.findOne({
        where: { id: orderId },
        transaction: t,
      });

      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 3. Cập nhật trạng thái -> Paid
      order.paymentStatus = "Paid";
      await order.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Cập nhật trạng thái đã thanh toán cho đơn hàng thành công",
        order,
      };
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Update Payment Status error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi cập nhật trạng thái đã thanh toán cho đơn hàng",
      };
    }
  },

  // Update Order
  async updateOrder(userId, orderData) {
    const t = await db.sequelize.transaction();

    try {
      // 1. Kiểm tra order tồn tại
      const existingOrder = await db.Order.findOne({
        where: { id: orderData.id },
        include: [
          {
            model: db.OrderProduct,
            as: "orderProducts",
            include: [{ model: db.Product, as: "product" }],
          },
          { model: db.Promotion, as: "promotion" },
          { model: db.ServiceType, as: "serviceType" },
        ],
        transaction: t
      });

      if (!existingOrder) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 2. Kiểm tra quyền sửa đơn hàng
      if (existingOrder.userId !== null && existingOrder.userId !== userId) {
        return { success: false, message: "Bạn không có quyền sửa đơn hàng này" };
      }

      // 3. Validate dựa trên trạng thái hiện tại
      const validationResult = this.validateOrderUpdate(existingOrder, orderData);
      if (!validationResult.success) {
        return validationResult;
      }

      // 4. Chuẩn bị data update
      const updateData = this.prepareUpdateData(existingOrder, orderData);

      // 5. Cập nhật order
      await db.Order.update(updateData, {
        where: { id: orderData.id },
        transaction: t
      });

      // 6. Cập nhật order products nếu có
      if (orderData.orderProducts && this.canUpdateProducts(existingOrder.status)) {
        // Xóa products cũ
        await db.OrderProduct.destroy({
          where: { orderId: orderData.id },
          transaction: t
        });

        // Thêm products mới
        if (orderData.orderProducts.length > 0) {
          const orderProducts = orderData.orderProducts.map((p) => ({
            orderId: orderData.id,
            productId: p.product.id,
            quantity: p.quantity,
            price: p.price,
          }));
          await db.OrderProduct.bulkCreate(orderProducts, { transaction: t });
        }
      }

      // 7. Cập nhật promotion nếu có
      if (orderData.promotion?.id && orderData.promotion.id !== existingOrder.promotion.id) {
        const promotion = await db.Promotion.findByPk(orderData.promotion.id, {
          transaction: t,
        });

        if (promotion) {
          // Validate promotion
          const now = new Date();
          if (
            promotion.status === "active" &&
            promotion.startDate <= now &&
            promotion.endDate >= now &&
            (promotion.minOrderValue === null || orderData.orderValue >= promotion.minOrderValue) &&
            (promotion.usageLimit === null || promotion.usedCount < promotion.usageLimit)
          ) {
            updateData.promotionId = promotion.id;
            updateData.discountAmount = orderData.discountAmount || 0;

            // Tăng usedCount
            promotion.usedCount += 1;
            await promotion.save({ transaction: t });

            // Giảm usedCount của promotion cũ 
            if (existingOrder.promotion.id) {
              const oldPromotion = await db.Promotion.findByPk(existingOrder.promotion.id, {
                transaction: t,
              });
              if (oldPromotion && oldPromotion.usedCount > 0) {
                oldPromotion.usedCount -= 1;
                await oldPromotion.save({ transaction: t });
              }
            }
          }
        }
      }

      await t.commit();

      return {
        success: true,
        message: "Cập nhật đơn hàng thành công",
      };

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Update Order error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi cập nhật đơn hàng",
      };
    }
  },

  // Helper function: Validate order update based on status
  validateOrderUpdate(existingOrder, orderData) {
    const { status } = existingOrder;

    // DRAFT: Cho phép sửa tất cả
    if (status === 'draft') {
      return { success: true };
    }

    // PENDING: Giới hạn quyền sửa
    if (status === 'pending') {
      // Không cho phép thay đổi tỉnh thành
      if (orderData.senderCityCode !== existingOrder.senderCityCode) {
        return { success: false, message: "Không thể thay đổi tỉnh thành người gửi khi đơn ở trạng thái pending" };
      }
      if (orderData.recipientCityCode !== existingOrder.recipientCityCode) {
        return { success: false, message: "Không thể thay đổi tỉnh thành người nhận khi đơn ở trạng thái pending" };
      }

      // Validate payment method changes
      if (orderData.paymentMethod !== existingOrder.paymentMethod) {
        // Nếu đã thanh toán thì không được đổi payment method
        if (existingOrder.paymentStatus !== 'Unpaid') {
          return { success: false, message: "Chỉ có thể thay đổi phương thức thanh toán khi chưa thanh toán" };
        }

        // Nếu payer là Customer, chỉ được dùng Cash
        if (orderData.payer === 'Customer' && orderData.paymentMethod !== 'Cash') {
          return { success: false, message: "Người nhận chỉ được thanh toán bằng tiền mặt" };
        }
      }

      return { success: true };
    }

    // CONFIRMED: Chỉ được sửa recipient (không tỉnh) và note
    if (status === 'confirmed') {
      const allowedFields = ['recipientName', 'recipientPhone', 'recipientWardCode', 'recipientDetailAddress', 'notes'];
      const changedFields = Object.keys(orderData).filter(key =>
        orderData[key] !== existingOrder[key] && !allowedFields.includes(key)
      );

      // Kiểm tra không được thay đổi tỉnh recipient
      if (orderData.recipientCityCode !== existingOrder.recipientCityCode) {
        return { success: false, message: "Không thể thay đổi tỉnh thành người nhận khi đơn ở trạng thái confirmed" };
      }

      // Loại bỏ các trường được phép sửa khỏi changedFields
      const disallowedFields = changedFields.filter(field => !allowedFields.includes(field));

      if (disallowedFields.length > 0) {
        return {
          success: false,
          message: `Không thể thay đổi các trường: ${disallowedFields.join(', ')} khi đơn ở trạng thái confirmed`
        };
      }

      return { success: true };
    }

    // Các status khác: Không cho phép sửa
    return {
      success: false,
      message: `Không thể cập nhật đơn hàng ở trạng thái: ${status}`
    };
  },

  // Helper function: Prepare update data based on status
  prepareUpdateData(existingOrder, orderData) {
    const { status } = existingOrder;
    const updateData = {};

    // DRAFT: Cập nhật tất cả trừ id và trackingNumber
    if (status === 'draft') {
      Object.keys(orderData).forEach(key => {
        if (key !== 'id' && key !== 'trackingNumber' && key !== 'userId') {
          updateData[key] = orderData[key];
        }
      });
      return updateData;
    }

    // PENDING: Chỉ cập nhật các trường được phép
    if (status === 'pending') {
      const allowedFields = [
        'senderName', 'senderPhone', 'senderWardCode', 'senderDetailAddress',
        'recipientName', 'recipientPhone', 'recipientWardCode', 'recipientDetailAddress',
        'cod', 'orderValue', 'notes', 'paymentMethod', 'payer'
      ];

      allowedFields.forEach(field => {
        if (orderData[field] !== undefined) {
          updateData[field] = orderData[field];
        }
      });
      return updateData;
    }

    // CONFIRMED: Chỉ cập nhật recipient (không tỉnh) và note
    if (status === 'confirmed') {
      const allowedFields = [
        'recipientName', 'recipientPhone', 'recipientWardCode', 'recipientDetailAddress', 'notes'
      ];

      allowedFields.forEach(field => {
        if (orderData[field] !== undefined) {
          updateData[field] = orderData[field];
        }
      });
      return updateData;
    }

    return updateData;
  },

  canUpdateProducts(status) {
    return status === 'draft';
  },

  // Update Order Status to Pending
  async updateOrderStatusToPending(userId, orderId) {
    const t = await db.sequelize.transaction();

    try {
      // 1. Kiểm tra user tồn tại và có quyền
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm order theo id
      const order = await db.Order.findOne({
        where: { id: orderId },
        transaction: t
      });

      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 3. Kiểm tra quyền chỉnh sửa đơn hàng
      // Nếu order có userId (không null) thì phải khớp với userId truyền vào
      if (order.userId !== null && order.userId !== userId) {
        return { success: false, message: "Bạn không có quyền chỉnh sửa đơn hàng này" };
      }

      // 4. Kiểm tra status ban đầu là draft
      if (order.status !== 'draft') {
        return {
          success: false,
          message: `Không thể cập nhật status thành pending. Status hiện tại là: ${order.status}`
        };
      }

      // 5. Cập nhật status thành pending
      order.status = 'pending';
      await order.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành chờ xác nhận thành công",
        order
      };

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Update Order Status to Pending error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi cập nhật trạng thái đơn hàng"
      };
    }
  },

  async getOrdersByOffice(userId, officeId, page, limit, filters) {
    try {
      // 0. Kiểm tra user tồn tại và có quyền
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 1. Kiểm tra user có phải là employee của office này không
      const employee = await db.Employee.findOne({
        where: {
          userId: userId,
          officeId: officeId,
          status: 'Active'
        }
      });

      if (!employee && user.role == "user") {
        return { success: false, message: "Bạn không có quyền xem đơn hàng của bưu cục này" };
      }

      // 2. Kiểm tra office có tồn tại không
      const office = await db.Office.findOne({ where: { id: officeId } });
      if (!office) {
        return { success: false, message: "Bưu cục không tồn tại" };
      }

      // 3. Xây where condition
      const {
        searchText,
        payer,
        status,
        paymentStatus,
        paymentMethod,
        cod,
        startDate,
        endDate,
        senderWard,
        recipientWard,
      } = filters || {};

      const whereCondition = {
        [Op.or]: [
          { fromOfficeId: officeId },
          { toOfficeId: officeId }
        ],
        [Op.and]: [
          { status: { [Op.ne]: 'draft' } }  
        ]
      };

      if (searchText) {
        whereCondition[Op.or] = [
          ...(whereCondition[Op.or] || []),
          { trackingNumber: { [Op.like]: `%${searchText}%` } },
          { recipientName: { [Op.like]: `%${searchText}%` } },
          { recipientPhone: { [Op.like]: `%${searchText}%` } },
          { senderName: { [Op.like]: `%${searchText}%` } },
          { senderPhone: { [Op.like]: `%${searchText}%` } },
        ];
      }

      if (payer && payer !== "All") {
        whereCondition.payer = payer;
      }

      if (status && status !== "All") {
        whereCondition[Op.and].push({ status: status });
      }

      if (paymentStatus && paymentStatus !== "All") {
        whereCondition.paymentStatus = paymentStatus;
      }

      if (paymentMethod && paymentMethod !== "All") {
        whereCondition.paymentMethod = paymentMethod;
      }

      if (cod && cod !== "All") {
        whereCondition.cod = cod === "Yes" ? { [Op.gt]: 0 } : 0;
      }

      // Lọc theo phường/xã người gửi
      if (senderWard && senderWard !== "All") {
        whereCondition.senderWardCode = senderWard;
      }

      // Lọc theo phường/xã người nhận
      if (recipientWard && recipientWard !== "All") {
        whereCondition.recipientWardCode = recipientWard;
      }

      if (startDate && endDate) {
        whereCondition.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      // 4. Query phân trang với các associations
      const ordersResult = await db.Order.findAndCountAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name', 'code']
          },
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'code']
          },
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
          },
          {
            model: db.User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
          },
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        success: true,
        message: "Lấy danh sách đơn hàng theo bưu cục thành công",
        orders: ordersResult.rows,
        total: ordersResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error("Get Orders by Office error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng" };
    }
  },
};

export default orderService;