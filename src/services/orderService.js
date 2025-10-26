import { Op } from 'sequelize';
import db from '../models';
import paymentService from './paymentService';
import { createTransaction } from './transactionService';
import notificationService from './notificationService';
import { calculateDistance, calculateTravelTime, calculateRouteMetrics } from '../utils/routeUtils';
import transaction from '../models/transaction';
import shipment from '../models/shipment';

function generateTrackingNumber(length = 14) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const orderService = {
  async listOrders(params) {
    try {
      const { page = 1, limit = 20, search = "", status, fromOfficeId, toOfficeId, userId, serviceTypeId } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};

      console.log("Params:", { page, limit, search, status, fromOfficeId, toOfficeId, userId, serviceTypeId });

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
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address', 'type'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address', 'type'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] },
          { model: db.Product, as: 'products', attributes: ['id', 'name', 'weight', 'type'], through: { attributes: ['quantity'] } }
        ]
      });

      return { success: true, data: rows, pagination: { page: Number(page), limit: Number(limit), total: count } };
    } catch (error) {
      return { success: false, message: "Lỗi server khi lấy danh sách đơn hàng" };
    }
  },

  async getOrderById(orderId) {
    try {
      console.log('=== ORDER SERVICE GET ORDER BY ID START ===', { orderId });
      const order = await db.Order.findByPk(orderId, {
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address', 'phoneNumber', 'type', 'status'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address', 'phoneNumber', 'type', 'status'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime', 'status'] },
          { model: db.Product, as: 'products', attributes: ['id', 'name', 'weight', 'type', 'status'], through: { attributes: ['quantity'] } },
          { model: db.OrderHistory, as: 'histories', attributes: ['id', 'action', 'note', 'actionTime'] }
        ],
        order: [[{ model: db.OrderHistory, as: 'histories' }, 'actionTime', 'DESC']]
      });

      if (!order) {
        console.log('Order not found for id:', orderId);
        return { success: false, message: "Không tìm thấy đơn hàng" };
      }
      console.log('Order found:', { id: order.id, toOfficeId: order.toOfficeId, status: order.status });
      return { success: true, data: order };
    } catch (error) {
      console.error('=== ORDER SERVICE GET ORDER BY ID ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return { success: false, message: "Lỗi server khi lấy chi tiết đơn hàng" };
    }
  },

  async updateOrderStatus(orderId, updateData = {}, officeId) {
    const t = await db.sequelize.transaction();
    try {
      const order = await db.Order.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return { success: false, message: "Không tìm thấy đơn hàng" };
      }

      // Optional access check: order must belong to shipper's office
      if (officeId && order.toOfficeId !== Number(officeId)) {
        await t.rollback();
        return { success: false, message: 'Đơn không thuộc bưu cục của bạn' };
      }

      // Only allow specific fields to be updated safely
      const nextStatus = updateData?.status;
      if (typeof nextStatus === 'string' && nextStatus.length > 0) {
        order.status = nextStatus;
      }

      // Nếu shipper bắt đầu giao từ trạng thái picked_up → delivering, chỉ cập nhật status
      // deliveredAt when delivered
      if (nextStatus === 'delivered') {
        order.deliveredAt = new Date();

        // Validate COD amount if provided
        if (updateData.codCollected !== undefined) {
          if (updateData.codCollected !== order.cod) {
            await t.rollback();
            return {
              success: false,
              message: `Số tiền COD phải bằng ${order.cod.toLocaleString()}đ`
            };
          }
        }

        // Validate total amount collected
        if (updateData.totalAmountCollected !== undefined) {
          const expectedAmount = order.cod + order.shippingFee - order.discountAmount;
          if (updateData.totalAmountCollected !== expectedAmount) {
            await t.rollback();
            return {
              success: false,
              message: `Tổng số tiền phải bằng ${expectedAmount.toLocaleString()}đ (COD + Phí vận chuyển - Giảm giá)`
            };
          }
        }

        // Create ShippingCollection record for COD tracking
        if (order.cod > 0 && updateData.codCollected) {
          await db.ShippingCollection.create({
            orderId: order.id,
            shipperId: updateData.shipperId,
            amountCollected: updateData.codCollected,
            discrepancy: 0, // No discrepancy if amounts match
            notes: updateData.notes || 'Shipper thu tiền COD khi giao hàng'
          }, { transaction: t });
        }
      }

      // Persist
      await order.save({ transaction: t });
      await t.commit();
      return { success: true, data: order };
    } catch (error) {
      await t.rollback();
      console.error('Update order status error:', error);
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

  // Get Status Enum
  async getOrderStatuses(userId) {
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
  async getOrderPaymentMethods(userId) {
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
  async createUserOrder(userId, orderData) {
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

          // Kiểm tra tồn kho trước khi tạo đơn
          const product = await db.Product.findByPk(p.product.id, { transaction: t });
          if (!product) throw new Error(`Sản phẩm với ID ${p.product.id} không tồn tại`);
          if (product.stock < p.quantity)
            throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho. Chỉ còn ${product.stock} sản phẩm`);

          totalOrderValue += p.price * p.quantity;
        }
        if (orderData.orderValue < totalOrderValue)
          throw new Error("Tổng giá trị đơn hàng không khớp với sản phẩm");
      } else {
        if (orderData.orderValue <= 0)
          throw new Error("Gía trị đơn hàng phải lớn hơn 0");
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

      // 7. Validate địa chỉ người gửi và người nhận có thuộc khu vực phục vụ không
      const senderOffice = await db.Office.findOne({
        where: { codeCity: orderData.senderCityCode },
      });
      if (!senderOffice) throw new Error("Địa chỉ người gửi chưa nằm trong khu vực phục vụ của chúng tôi");

      const recipientOffice = await db.Office.findOne({
        where: { codeCity: orderData.recipientCityCode },
      });
      if (!recipientOffice) throw new Error("Địa chỉ người nhận chưa nằm trong khu vực phục vụ của chúng tôi");
      // Kiểm tra xem địa chỉ người gửi có thuộc fromOffice
      const checkSenderOffice = await db.Office.findOne({
        where: { codeCity: orderData.fromOffice.codeCity },
      });
      if (!checkSenderOffice) throw new Error("Địa chỉ người gửi không thuộc bưu cục nhận đã chọn");

      // 8. Validate payer & payment method
      const validPayers = ["Shop", "Customer"];
      if (!validPayers.includes(orderData.payer))
        throw new Error("Người trả phí không hợp lệ");
      if (orderData.payer === "Customer" && orderData.paymentMethod !== "Cash")
        throw new Error("Khách hàng chỉ được thanh toán tiền mặt");

      // 9. Generate trackingNumber nếu chưa có
      const trackingNumber =
        orderData.trackingNumber || generateTrackingNumber(14);

      // 10. Xác định createdBy và createdByType theo role của user hiện tại
      const createdBy = currentUser.id;
      const createdByType = currentUser.role;

      // 11. Xác định user tạo đơn hàng
      let orderUserId = currentUser.id;

      // 12. Tạo Order
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
          totalFee: Math.ceil(
            Math.max(((orderData.shippingFee || 0) - (orderData.discountAmount || 0)), 0) * 1.1 +
            (orderData.orderValue ? orderData.orderValue * 0.005 : 0) +
            (orderData.codAmount ? orderData.codAmount * 0.02 : 0)
          )
        },
        { transaction: t }
      );

      // 13. Lưu OrderProduct nếu có và cập nhật số lượng sản phẩm
      if (orderData.orderProducts?.length > 0) {
        const orderProducts = orderData.orderProducts.map((p) => ({
          orderId: order.id,
          productId: p.product.id,
          quantity: p.quantity,
          price: p.price,
        }));
        await db.OrderProduct.bulkCreate(orderProducts, { transaction: t });

        // 12.1. CẬP NHẬT soldQuantity VÀ stock CHO TỪNG SẢN PHẨM
        for (const p of orderData.orderProducts) {
          const product = await db.Product.findByPk(p.product.id, { transaction: t });
          if (product) {
            await product.increment('soldQuantity', { by: p.quantity, transaction: t });
            await product.decrement('stock', { by: p.quantity, transaction: t });
          }
        }
      }

      // 14. Update promotion usedCount
      if (promotion) {
        promotion.usedCount += 1;
        await promotion.save({ transaction: t });
      }

      await t.commit();

      if (order.status == 'pending') {
        await db.OrderHistory.create({
          orderId: order.id,
          action: 'ReadyForPickup',
          actionTime: new Date()
        });
      }

      // 15. Load lại order đầy đủ
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

  async getUserOrders(userId, page, limit, filters) {
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
        sort,
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
          { notes: { [Op.like]: `%${searchText}%` } },
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
        whereCondition[Op.or] = [
          {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          {
            deliveredAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
        ];
      }

      let orderCondition = [["createdAt", "DESC"]];

      if (sort) {
        switch (sort) {
          case "newest":
            orderCondition = [["createdAt", "DESC"]];
            break;
          case "oldest":
            orderCondition = [["createdAt", "ASC"]];
            break;
          case "codHigh":
            orderCondition = [["cod", "DESC"]];
            break;
          case "codLow":
            orderCondition = [["cod", "ASC"]];
            break;
          case "orderValueHigh":
            orderCondition = [["orderValue", "DESC"]];
            break;
          case "orderValueLow":
            orderCondition = [["orderValue", "ASC"]];
            break;
          case "feeHigh":
            orderCondition = [["totalFee", "DESC"]];
            break;
          case "feeLow":
            orderCondition = [["totalFee", "ASC"]];
            break;
          case "weightHigh":
            orderCondition = [["weight", "DESC"]];
            break;
          case "weightLow":
            orderCondition = [["weight", "ASC"]];
            break;
          default:
            orderCondition = [["createdAt", "DESC"]];
        }
      }

      // 3. Query phân trang
      const ordersResult = await db.Order.findAndCountAll({
        where: whereCondition,
        order: orderCondition,
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
  async getOrderPaymentStatuses(userId) {
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
  async getOrderPayers(userId) {
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
  async cancelUserOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm order theo id + userId (bao gồm cả sản phẩm và promotion)
      const order = await db.Order.findOne({
        where: { id: orderId, userId: userId },
        include: [
          {
            model: db.OrderProduct,
            as: "orderProducts",
            include: [{ model: db.Product, as: "product" }],
          },
          { model: db.Promotion, as: "promotion" },
        ],
        transaction: t,
      });

      console.log("order", order);
      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 3. Kiểm tra trạng thái có cho phép hủy không
      const cancellableStatuses = ["draft", "pending", "confirmed"];
      if (!cancellableStatuses.includes(order.status)) {
        return { success: false, message: "Không thể hủy đơn ở trạng thái hiện tại" };
      }

      // 4. KHÔI PHỤC STOCK VÀ SOLDQUANTITY CỦA SẢN PHẨM
      if (order.orderProducts?.length > 0) {
        for (const orderProduct of order.orderProducts) {
          const product = await db.Product.findByPk(orderProduct.productId, { transaction: t });
          if (product) {
            // Hoàn trả stock và giảm soldQuantity
            await product.increment('stock', { by: orderProduct.quantity, transaction: t });
            await product.decrement('soldQuantity', { by: orderProduct.quantity, transaction: t });
          }
        }
      }

      // 5. KHÔI PHỤC USEDCOUNT CỦA PROMOTION (nếu có)
      if (order.promotionId) {
        const promotion = await db.Promotion.findByPk(order.promotionId, { transaction: t });
        if (promotion && promotion.usedCount > 0) {
          promotion.usedCount -= 1;
          await promotion.save({ transaction: t });
        }
      }

      // 6. Nếu đã thanh toán bằng VNPay, refund trước
      console.log("payment", order.paymentMethod);
      if (order.paymentMethod === "VNPay" && order.paymentStatus === "Paid") {
        const refundResult = await paymentService.refundVNPay(order.id);
        if (!refundResult.success) {
          // sandbox có thể fail refund, nhưng vẫn cho hủy đơn test
          console.warn("Refund sandbox không thành công:", refundResult.message);
        }
        // Thay trạng thái thanh toán thành Refunded
        order.paymentStatus = "Refunded";
        order.refundedAt = new Date();

        // Chỉ tạo transaction nếu chưa tồn tại
        const existingTransaction = await db.Transaction.findOne({
          where: { orderId: order.id, type: 'Income' },
          transaction: t,
        });

        if (!existingTransaction) {
          await createTransaction({
            orderId: order.id,
            userId: order.userId,
            amount: order.totalFee,
            type: 'Income',
            method: order.paymentMethod,
            purpose: 'Refund',
            title: 'Hoàn phí vận chuyển online',
            notes: `Hoàn phí vận chuyển cho đơn hàng #${order.trackingNumber}`,
            transaction: t
          });
        }

        const data = {
          title: `Hoàn tiền cho đơn hàng`,
          message: `Xử lý hoàn tiền thành công cho đơn hàng #${order.trackingNumber}`,
          type: 'order',
          userId: user.id,
          targetRole: 'user',
          relatedId: order.id,
          relatedType: 'order',
        };

        await notificationService.createNotification(data, t);
      }

      // 7. Cập nhật trạng thái -> cancelled
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

  // Get Order by Tracking Number
  async getOrderByTrackingNumber(userId, trackingNumber) {
    try {
      const { Op } = db.Sequelize;

      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Employee,
            as: "employee",
            include: [
              { model: db.Office, as: "office" }
            ]
          }
        ]
      });

      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Clean trackingNumber
      const cleanTrackingNumber = trackingNumber.trim().toUpperCase();

      // 3. Xác định điều kiện tìm kiếm dựa trên role
      const whereCondition = {
        trackingNumber: { [Op.like]: `%${cleanTrackingNumber}%` }
      };

      if (user.role === "user") {
        // Customer chỉ xem đơn của mình
        whereCondition.userId = userId;
      } else if (user.role === "manager") {
        // Manager chỉ xem đơn có liên quan đến bưu cục của họ (gửi đi hoặc nhận về)
        whereCondition[Op.or] = [
          { fromOfficeId: user.employee.office.id },
          { toOfficeId: user.employee.office.id },
        ];
      }
      // Admin không cần thêm điều kiện, xem tất cả

      // 4. Tìm order
      const order = await db.Order.findOne({
        where: whereCondition,
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
          {
            model: db.OrderHistory,
            as: "histories",
            attributes: ['action', 'actionTime'],
            include: [
              { model: db.Office, as: 'fromOffice', attributes: ['name'] },
              { model: db.Office, as: 'toOffice', attributes: ['name'] },
            ],
          },
        ],
      });

      if (!order) {
        return {
          success: false,
          message: "Không tìm thấy đơn hàng với mã vận đơn này hoặc bạn không có quyền xem"
        };
      }

      return {
        success: true,
        message: "Lấy đơn hàng thành công",
        order,
      };
    } catch (error) {
      console.error("Get Order by Tracking Number error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng" };
    }
  },

  // Update Payment Status
  async updatePaymentStatus(orderId, status) {
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

      // 3. Cập nhật trạng thái
      order.paymentStatus = status;

      // Nếu trạng thái là Paid thì cập nhật paidAt = thời gian hiện tại
      if (status === 'Paid') {
        order.paidAt = order.paidAt || new Date();
        order.status = 'confirmed';

        // Chỉ tạo transaction nếu chưa tồn tại
        const existingTransaction = await db.Transaction.findOne({
          where: { orderId: order.id, type: 'Expense' },
          transaction: t,
        });

        if (!existingTransaction) {
          await createTransaction({
            orderId: order.id,
            userId: order.userId,
            amount: order.totalFee,
            type: 'Expense',
            method: order.paymentMethod,
            purpose: 'ShippingService',
            title: 'Thanh toán phí vận chuyển online',
            notes: `Thanh toán thành công cho đơn hàng #${order.trackingNumber}`,
            transaction: t
          });
        }

        const data = {
          title: `Thanh toán cho đơn hàng`,
          message: `Thanh toán thành công cho đơn hàng #${order.trackingNumber}`,
          type: 'order',
          userId: order.userId,
          targetRole: 'user',
          relatedId: order.id,
          relatedType: 'order',
        };

        await notificationService.createNotification(data, t);
      } else {
        order.paidAt = null;
      }

      await order.save({ transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Cập nhật trạng thái cho đơn hàng thành công",
        order,
      };
    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Update Payment Status error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi cập nhật trạng thái cho đơn hàng",
      };
    }
  },

  // Update Order
async updateUserOrder(userId, orderData) {
  const t = await db.sequelize.transaction();

  try {
    // 1️⃣ Lấy order hiện tại
    const existingOrder = await db.Order.findOne({
      where: { id: orderData.id },
      include: [
        { model: db.OrderProduct, as: "orderProducts", include: [{ model: db.Product, as: "product" }] },
        { model: db.Promotion, as: "promotion" },
        { model: db.ServiceType, as: "serviceType" },
      ],
      transaction: t,
    });

    if (!existingOrder) return { success: false, message: "Đơn hàng không tồn tại" };

    // 2️⃣ Kiểm tra quyền người dùng
    if (existingOrder.userId !== null && existingOrder.userId !== userId)
      return { success: false, message: "Bạn không có quyền sửa đơn hàng này" };

    const { status } = existingOrder;
    const normalize = (val) => val == null ? null : (typeof val === "string" ? val.trim() : val);

    // 3️⃣ Validate theo trạng thái
    const validation = (() => {
      if (status === "draft") return { success: true };

      if (status === "pending") {
        if (orderData.senderCityCode && normalize(orderData.senderCityCode) !== normalize(existingOrder.senderCityCode))
          return { success: false, message: "Không thể thay đổi tỉnh thành người gửi" };
        if (orderData.recipientCityCode && normalize(orderData.recipientCityCode) !== normalize(existingOrder.recipientCityCode))
          return { success: false, message: "Không thể thay đổi tỉnh thành người nhận" };
        if (orderData.orderValue && normalize(orderData.orderValue) !== normalize(existingOrder.orderValue))
          return { success: false, message: "Không thể thay đổi giá trị đơn hàng" };
        if (orderData.codAmount && normalize(orderData.codAmount) !== normalize(existingOrder.codAmount))
          return { success: false, message: "Không thể thay đổi COD đơn hàng" };
        if (orderData.paymentMethod && normalize(orderData.paymentMethod) !== normalize(existingOrder.paymentMethod)) {
          if (existingOrder.paymentStatus !== "Unpaid")
            return { success: false, message: "Chỉ có thể thay đổi phương thức thanh toán khi chưa thanh toán" };
          if (orderData.payer === "Customer" && orderData.paymentMethod !== "Cash")
            return { success: false, message: "Người nhận chỉ được thanh toán bằng tiền mặt" };
        }
        return { success: true };
      }

      if (status === "confirmed") {
        // Chỉ check recipientCityCode
        if (orderData.recipientCityCode && normalize(orderData.recipientCityCode) !== normalize(existingOrder.recipientCityCode))
          return { success: false, message: "Không thể thay đổi tỉnh thành người nhận" };
        return { success: true };
      }

      return { success: false, message: `Không thể cập nhật đơn hàng ở trạng thái: ${status}` };
    })();

    if (!validation.success) return validation;

    // 4️⃣ Kiểm tra vùng phục vụ nếu draft và đổi thành phố
    if (status === "draft") {
      const senderChanged = normalize(orderData.senderCityCode) !== normalize(existingOrder.senderCityCode);
      const recipientChanged = normalize(orderData.recipientCityCode) !== normalize(existingOrder.recipientCityCode);
      if (senderChanged || recipientChanged) {
        const senderOffice = await db.Office.findOne({ where: { codeCity: orderData.senderCityCode }, transaction: t });
        const recipientOffice = await db.Office.findOne({ where: { codeCity: orderData.recipientCityCode }, transaction: t });
        if (!senderOffice && !recipientOffice)
          return { success: false, message: "Cả người gửi và người nhận đều nằm ngoài khu vực phục vụ" };
        if (!senderOffice) return { success: false, message: "Địa chỉ người gửi nằm ngoài khu vực phục vụ" };
        if (!recipientOffice) return { success: false, message: "Địa chỉ người nhận nằm ngoài khu vực phục vụ" };
      }
    }

    // 5️⃣ Chuẩn bị dữ liệu update chỉ những field khác
    const updateData = {};
    Object.keys(orderData).forEach(key => {
      if (!["id", "trackingNumber", "userId"].includes(key) &&
          normalize(orderData[key]) !== normalize(existingOrder[key])) {
        updateData[key] = orderData[key];
      }
    });

    // 6️⃣ Xử lý orderProducts nếu draft
    if (status === "draft" && orderData.orderProducts) {
      for (const old of existingOrder.orderProducts || []) {
        const product = await db.Product.findByPk(old.productId, { transaction: t });
        if (product) {
          await product.increment("stock", { by: old.quantity, transaction: t });
          await product.decrement("soldQuantity", { by: old.quantity, transaction: t });
        }
      }
      await db.OrderProduct.destroy({ where: { orderId: orderData.id }, transaction: t });

      for (const p of orderData.orderProducts) {
        const product = await db.Product.findByPk(p.product.id, { transaction: t });
        if (!product) throw new Error(`Sản phẩm ID ${p.product.id} không tồn tại`);
        if (product.stock < p.quantity) throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`);
      }

      await db.OrderProduct.bulkCreate(
        orderData.orderProducts.map(p => ({ orderId: orderData.id, productId: p.product.id, quantity: p.quantity, price: p.price })),
        { transaction: t }
      );

      for (const p of orderData.orderProducts) {
        const product = await db.Product.findByPk(p.product.id, { transaction: t });
        if (product) {
          await product.increment("soldQuantity", { by: p.quantity, transaction: t });
          await product.decrement("stock", { by: p.quantity, transaction: t });
        }
      }
    }

    // 7️⃣ Cập nhật đơn hàng
    if (Object.keys(updateData).length > 0)
      await db.Order.update(updateData, { where: { id: orderData.id }, transaction: t });

    // 8️⃣ Cập nhật promotion nếu có
    if (orderData.promotion?.id && orderData.promotion.id !== existingOrder.promotion?.id) {
      const promotion = await db.Promotion.findByPk(orderData.promotion.id, { transaction: t });
      if (promotion) {
        const now = new Date();
        if (promotion.status === "active" &&
            promotion.startDate <= now &&
            promotion.endDate >= now &&
            (!promotion.minOrderValue || orderData.orderValue >= promotion.minOrderValue) &&
            (!promotion.usageLimit || promotion.usedCount < promotion.usageLimit)) {

          await db.Order.update(
            { promotionId: promotion.id, discountAmount: orderData.discountAmount || 0 },
            { where: { id: orderData.id }, transaction: t }
          );

          await promotion.increment("usedCount", { by: 1, transaction: t });

          if (existingOrder.promotion?.id) {
            const old = await db.Promotion.findByPk(existingOrder.promotion.id, { transaction: t });
            if (old && old.usedCount > 0) await old.decrement("usedCount", { by: 1, transaction: t });
          }
        }
      }
    }

    await t.commit();
    return { success: true, message: "Cập nhật đơn hàng thành công" };
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Update Order error:", error);
    return { success: false, message: error.message || "Lỗi server khi cập nhật đơn hàng" };
  }
},

  // Update Order Status to Pending
  async setOrderToPending(userId, orderId) {
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

      // Gửi thông báo cho user
      const data = {
        title: `Đơn hàng đã được xác nhận`,
        message: `Đơn hàng #${order.trackingNumber} đã được nhân viên bưu cục xác nhận. Đơn hàng sẽ được đến lấy trong vòng 24h.`,
        type: 'order',
        userId: order.userId,
        targetRole: 'user',
        relatedId: order.trackingNumber,
        relatedType: 'order',
      };
      await notificationService.createNotification({ data, transaction: t });

      await t.commit();

      if (order.status == 'pending') {
        await db.OrderHistory.create({
          orderId: order.id,
          action: 'ReadyForPickup',
          actionTime: new Date()
        });
      }

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

  async getUserOrdersDashboard(userId, startDate, endDate) {
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Build where condition chỉ cần ngày
      const whereCondition = { userId };

      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        whereCondition.createdAt = {
          [db.Sequelize.Op.between]: [start, end],
        };
      }

      // 3. Query, chỉ lấy những trường cần thiết để chart
      const ordersResult = await db.Order.findAll({
        where: whereCondition,
        attributes: ['id', 'status', 'createdAt'],
        order: [['createdAt', 'ASC']],
      });

      return {
        success: true,
        message: "Lấy đơn hàng cho dashboard thành công",
        orders: ordersResult,
      };
    } catch (error) {
      console.error("Get Orders Dashboard error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng dashboard" };
    }
  },

  //============== For Manager ======================//

  async getOrdersByOfficeId(userId, officeId, page, limit, filters) {
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
        sort,
        startDate,
        endDate,
        senderWard,
        recipientWard,
      } = filters || {};

      // Tạo điều kiện cơ bản
      const whereCondition = {
        [Op.and]: [
          {
            [Op.or]: [
              { fromOfficeId: officeId },
              { toOfficeId: officeId }
            ]
          },
          { status: { [Op.ne]: 'draft' } }
        ]
      };

      // Xử lý searchText - THÊM vào điều kiện Op.or thay vì ghi đè
      if (searchText) {
        const searchConditions = [
          { trackingNumber: { [Op.like]: `%${searchText}%` } },
          { recipientName: { [Op.like]: `%${searchText}%` } },
          { recipientPhone: { [Op.like]: `%${searchText}%` } },
          { senderName: { [Op.like]: `%${searchText}%` } },
          { senderPhone: { [Op.like]: `%${searchText}%` } },
          { notes: { [Op.like]: `%${searchText}%` } },
        ];

        // Thêm điều kiện search vào mảng Op.and
        whereCondition[Op.and].push({
          [Op.or]: searchConditions
        });
      }

      if (payer && payer !== "All") {
        whereCondition[Op.and].push({ payer: payer });
      }

      if (status && status !== "All") {
        whereCondition[Op.and].push({ status: status });
      }

      if (paymentStatus && paymentStatus !== "All") {
        whereCondition[Op.and].push({ paymentStatus: paymentStatus });
      }

      if (paymentMethod && paymentMethod !== "All") {
        whereCondition[Op.and].push({ paymentMethod: paymentMethod });
      }

      if (cod && cod !== "All") {
        whereCondition[Op.and].push(
          cod === "Yes" ? { cod: { [Op.gt]: 0 } } : { cod: 0 }
        );
      }

      // Lọc theo phường/xã người gửi
      if (senderWard && senderWard !== "All") {
        whereCondition[Op.and].push({ senderWardCode: senderWard });
      }

      // Lọc theo phường/xã người nhận
      if (recipientWard && recipientWard !== "All") {
        whereCondition[Op.and].push({ recipientWardCode: recipientWard });
      }

      if (startDate && endDate) {
        whereCondition[Op.or] = [
          {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          {
            deliveredAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
        ];
      }

      let orderCondition = [["createdAt", "DESC"]];

      if (sort) {
        switch (sort) {
          case "newest":
            orderCondition = [["createdAt", "DESC"]];
            break;
          case "oldest":
            orderCondition = [["createdAt", "ASC"]];
            break;
          case "codHigh":
            orderCondition = [["cod", "DESC"]];
            break;
          case "codLow":
            orderCondition = [["cod", "ASC"]];
            break;
          case "orderValueHigh":
            orderCondition = [["orderValue", "DESC"]];
            break;
          case "orderValueLow":
            orderCondition = [["orderValue", "ASC"]];
            break;
          case "feeHigh":
            orderCondition = [["totalFee", "DESC"]];
            break;
          case "feeLow":
            orderCondition = [["totalFee", "ASC"]];
            break;
          case "weightHigh":
            orderCondition = [["weight", "DESC"]];
            break;
          case "weightLow":
            orderCondition = [["weight", "ASC"]];
            break;
          default:
            orderCondition = [["createdAt", "DESC"]];
        }
      }

      // 4. Query phân trang với các associations
      const ordersResult = await db.Order.findAndCountAll({
        where: whereCondition,
        order: orderCondition,
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

  // Confirm Order and Assign To Office
  async confirmAndAssignOrder(userId, orderId, officeId) {
    const t = await db.sequelize.transaction();

    try {
      // 1. Kiểm tra user tồn tại và có role manager
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      if (user.role !== 'manager') {
        return { success: false, message: "Chỉ manager mới có quyền duyệt đơn hàng" };
      }

      // 2. Kiểm tra order tồn tại - THÊM toOffice VÀO INCLUDE
      const order = await db.Order.findOne({
        where: { id: orderId },
        include: [
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name', 'codeCity']
          },
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'codeCity']
          }
        ],
        transaction: t
      });

      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 3. Kiểm tra user có thuộc office của fromOffice không
      if (order.fromOfficeId) {
        const employee = await db.Employee.findOne({
          where: {
            userId: userId,
            officeId: order.fromOfficeId,
            status: 'Active'
          },
          transaction: t
        });

        if (!employee) {
          return {
            success: false,
            message: "Bạn không có quyền duyệt đơn hàng từ bưu cục này"
          };
        }
      }

      // 4. Kiểm tra officeId có tồn tại không
      const toOffice = await db.Office.findByPk(officeId, { transaction: t });
      if (!toOffice) {
        return { success: false, message: "Bưu cục nhận không tồn tại" };
      }

      // 5. Kiểm tra officeId có tỉnh trùng với recipientCityCode không
      if (toOffice.codeCity !== order.recipientCityCode) {
        return {
          success: false,
          message: "Bưu cục nhận không thuộc tỉnh/thành của người nhận"
        };
      }

      // 6. Kiểm tra trạng thái hiện tại có thể chuyển thành confirmed không
      const allowedStatuses = ["pending"];
      if (!allowedStatuses.includes(order.status)) {
        return {
          success: false,
          message: `Không thể duyệt đơn hàng ở trạng thái: ${order.status}`
        };
      }

      // 7. KIỂM TRA ĐIỀU KIỆN THANH TOÁN
      // Nếu payment method khác Cash và chưa thanh toán thì không cho duyệt
      if (order.paymentMethod !== 'Cash' && order.paymentStatus === 'Unpaid') {
        return {
          success: false,
          message: `Không thể duyệt đơn hàng. Phương thức thanh toán ${order.paymentMethod} cần được thanh toán trước khi duyệt`
        };
      }

      // 8. Cập nhật order: status thành confirmed và gán toOfficeId
      order.status = 'confirmed';
      order.toOfficeId = officeId;
      await order.save({ transaction: t });

      // 9. RELOAD ORDER ĐỂ CẬP NHẬT TOOFFICE
      await order.reload({
        include: [
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name', 'codeCity']
          },
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'codeCity']
          }
        ],
        transaction: t
      });

      const data = {
        title: `Thanh toán cho đơn hàng`,
        message: `Thanh toán thành công cho đơn hàng #${order.trackingNumber}`,
        type: 'order',
        userId: user.id,
        targetRole: 'user',
        relatedId: order.id,
        relatedType: 'order',
      };

      await notificationService.createNotification(data, t);

      await t.commit();

      console.log("order after reload:", order);
      console.log("toOffice data:", order.toOffice);

      return {
        success: true,
        message: "Duyệt đơn hàng và gán bưu cục nhận thành công",
        order
      };

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Approve Order and Assign To Office error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi duyệt đơn hàng"
      };
    }
  },

  // Create Order
  async createManagerOrder(userId, orderData) {
    const t = await db.sequelize.transaction();

    try {
      // 0. Lấy User đang thực hiện
      const currentUser = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Employee,
            as: 'employee',
            include: [
              {
                model: db.Office,
                as: 'office'
              }
            ]
          }
        ]
      });

      if (!currentUser) throw new Error("Người dùng không tồn tại");

      if (currentUser.role !== "manager" || currentUser.employee.status !== "Active") {
        throw new Error("Người dùng không có quyền để tạo đơn hàng");
      }

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

      if (orderData.shippingFee < 0)
        throw new Error("Phí vận chuyển không hợp lệ");

      // 4. Validate weight
      if (orderData.weight <= 0 || orderData.weight > 500)
        throw new Error("Khối lượng đơn hàng không hợp lệ");

      // 5. Validate service type
      const serviceType = await db.ServiceType.findByPk(orderData.serviceType.id);
      if (!serviceType) throw new Error("Loại dịch vụ không tồn tại");

      // 6. Validate địa chỉ người nhận có thuộc khu vực phục vụ không
      const recipientOffice = await db.Office.findOne({
        where: { codeCity: orderData.recipientCityCode },
      });
      console.log("orderData.toOffice.cityCode", orderData.toOffice.codeCity);
      if (!recipientOffice) throw new Error("Địa chỉ người nhận chưa nằm trong khu vực phục vụ của chúng tôi");
      // Kiểm tra xem địa chỉ người nhận có thuộc toOffice
      const checkRecipientOffice = await db.Office.findOne({
        where: { codeCity: orderData.toOffice.codeCity },
      });
      if (!checkRecipientOffice) throw new Error("Địa chỉ người nhận không thuộc bưu cục đến đã chọn");

      // 8. Validate payer
      const validPayers = ["Shop", "Customer"];
      if (!validPayers.includes(orderData.payer))
        throw new Error("Người trả phí không hợp lệ");

      // 9. Generate trackingNumber nếu chưa có
      const trackingNumber =
        orderData.trackingNumber || generateTrackingNumber(14);

      // 10. Xác định createdBy và createdByType theo role của user hiện tại
      const createdBy = currentUser.id;
      const createdByType = currentUser.role;

      // 11. Xác định user tạo đơn hàng
      let orderUserId = null;
      if (orderData.senderPhone) {
        const senderUser = await db.User.findOne({
          where: { phoneNumber: orderData.senderPhone },
          transaction: t
        });
        if (senderUser) {
          orderUserId = senderUser.id;
        }
      }

      const shippingFee = orderData.shippingFee || 0;
      const orderValue = orderData.orderValue || 0;

      // 12. Tạo Order
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
          discountAmount: 0,
          shippingFee: shippingFee,
          cod: 0,
          orderValue: orderValue,
          payer: orderData.payer,
          paymentMethod: "Cash",
          paymentStatus: orderData.paymentStatus,
          notes: orderData.notes,
          userId: orderUserId || null,
          status: "confirmed",
          fromOfficeId: currentUser.employee.office.id,
          toOfficeId: orderData.toOffice?.id,
          createdBy: createdBy,
          createdByType: createdByType,
          paidAt: orderData.payer == "Shop" ? new Date() : null,
          totalFee:
            Math.ceil((shippingFee || 0) * 1.1) +
            (orderValue ? orderValue * 0.005 : 0) + 10000,
        },
        { transaction: t }
      );

      if (order.payer === "Shop") {
        // Tạo giao dịch
        await createTransaction({
          orderId: order.id,
          officeId: order.fromOfficeId,
          amount: order.totalFee,
          type: 'Income',
          method: order.paymentMethod,
          purpose: 'ShippingService',
          title: 'Thu phí vận chuyển tại quầy',
          notes: `Thu phí vận chuyển cho đơn hàng #${order.trackingNumber}`,
          transaction: t
        });

        if (order.userId) {
          await createTransaction({
            orderId: order.id,
            userId: order.userId,
            amount: order.totalFee,
            type: 'Expense',
            method: order.paymentMethod,
            purpose: 'ShippingService',
            title: 'Thanh toán phí vận chuyển tại quầy',
            notes: `Thanh toán phí vận chuyển thành công cho đơn hàng #${order.trackingNumber}`,
            transaction: t
          });
        }
      }

      if (order.userId) {
        const data = {
          title: `Tạo đơn hàng thành công`,
          message: `Đơn hàng #${order.trackingNumber} đã được nhân viên bưu cục tạo. Nếu bạn không yêu cầu, vui lòng gửi Yêu cầu hỗ trợ hoặc Khiếu nại để được xử lý.`,
          type: 'order',
          userId: order.userId,
          targetRole: 'user',
          relatedId: order.id,
          relatedType: 'order',
        };

        await notificationService.createNotification(data, t);
      }

      await t.commit();

      await db.OrderHistory.create({
        orderId: order.id,
        action: 'Imported',
        actionTime: new Date(),
        fromOfficeId: null,
        shipmentId: null,
        toOfficeId: currentUser.employee.office.id,
      });

      // 15. Load lại order đầy đủ
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

  async cancelManagerOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Lấy order
      const order = await db.Order.findOne({
        where: { id: orderId },
        include: [
          { model: db.OrderProduct, as: "orderProducts", include: [{ model: db.Product, as: "product" }] },
          { model: db.Promotion, as: "promotion" },
        ],
        transaction: t,
      });
      if (!order) return { success: false, message: "Đơn hàng không tồn tại" };

      // 3. Phân quyền
      const isManager = user.role === "manager";
      if (!isManager) {
        return { success: false, message: "Bạn không có quyền hủy đơn hàng" };
      } else {
        const employee = await db.Employee.findOne({
          where: { userId: userId, officeId: order.fromOfficeId, status: "Active" },
        });

        if (!employee) {
          return { success: false, message: "Bạn không có quyền hủy đơn vì không thuộc bưu cục gửi" };
        }
      }

      // 4. Kiểm tra trạng thái có thể hủy
      const cancellableStatuses = ["confirmed", "picked_up"];
      if (!cancellableStatuses.includes(order.status)) {
        return { success: false, message: "Không thể hủy đơn ở trạng thái hiện tại" };
      }

      // 5. Khôi phục stock & soldQuantity
      if (order.orderProducts?.length > 0) {
        for (const op of order.orderProducts) {
          const product = await db.Product.findByPk(op.productId, { transaction: t });
          if (product) {
            await product.increment("stock", { by: op.quantity, transaction: t });
            await product.decrement("soldQuantity", { by: op.quantity, transaction: t });
          }
        }
      }

      // 6. Khôi phục promotion nếu có
      if (order.promotionId) {
        const promotion = await db.Promotion.findByPk(order.promotionId, { transaction: t });
        if (promotion && promotion.usedCount > 0) {
          promotion.usedCount -= 1;
          await promotion.save({ transaction: t });
        }
      }

      // 7. Xử lý hoàn tiền nếu cần
      if (order.paymentMethod === "VNPay" && order.paymentStatus === "Paid") {
        const refundResult = await paymentService.refundVNPay(order.id);
        if (!refundResult.success) console.warn("Refund VNPay thất bại:", refundResult.message);
        order.paymentStatus = "Refunded";
        order.refundedAt = new Date();

        // Chỉ tạo transaction nếu chưa tồn tại
        const existingTransaction = await db.Transaction.findOne({
          where: { orderId: order.id, userId: order.userId, type: 'Income' },
          transaction: t,
        });

        if (!existingTransaction) {
          await createTransaction({
            orderId: order.id,
            userId: order.userId,
            amount: order.totalFee,
            type: 'Income',
            method: order.paymentMethod,
            purpose: 'Refund',
            title: 'Hoàn phí vận chuyển online',
            notes: `Hoàn phí vận chuyển cho đơn hàng #${order.trackingNumber}`,
            transaction: t
          });
        }
      } else if (order.paymentMethod === "Cash" && order.paymentStatus === "Paid") {
        // Đánh dấu đã thanh toán nhưng hủy => cần xử lý hoàn tiền thủ công nếu có
        order.paymentStatus = "Refunded"; // hoặc "RefundRequired" nếu muốn tách riêng
        order.refundedAt = new Date();

        // Chỉ tạo transaction nếu chưa tồn tại cho bưu cục
        const existingTransaction = await db.Transaction.findOne({
          where: { orderId: order.id, officeId: order.fromOfficeId, type: 'Expense' },
          transaction: t,
        });

        if (!existingTransaction) {
          await createTransaction({
            orderId: order.id,
            officeId: order.fromOfficeId,
            amount: order.totalFee,
            type: 'Expense',
            method: order.paymentMethod,
            purpose: 'Refund',
            title: 'Hoàn phí vận chuyển tại quầy',
            notes: `Hoàn phí vận chuyển cho đơn hàng #${order.trackingNumber}`,
            transaction: t
          });
        }

        if (order.userId) {
          const existingTransaction = await db.Transaction.findOne({
            where: { orderId: order.id, userId: order.userId, type: 'Income' },
            transaction: t,
          });

          if (!existingTransaction) {
            await createTransaction({
              orderId: order.id,
              userId: order.userId,
              amount: order.totalFee,
              type: 'Income',
              method: order.paymentMethod,
              purpose: 'Refund',
              title: 'Hoàn phí vận chuyển tại quầy',
              notes: `Hoàn phí vận chuyển cho đơn hàng #${order.trackingNumber}`,
              transaction: t
            });
          }
        }
      }

      // 8. Cập nhật trạng thái hủy
      order.status = "cancelled";
      await order.save({ transaction: t });

      // Gửi thông báo cho user
      const data = {
        title: `Hủy đơn hàng thành công`,
        message: `Đơn hàng #${order.trackingNumber} đã được nhân viên bưu cục hủy. Nếu bạn không yêu cầu thay đổi này, vui lòng gửi Yêu cầu hỗ trợ hoặc Khiếu nại để được xử lý.`,
        type: 'order',
        userId: order.userId,
        targetRole: 'user',
        relatedId: order.id,
        relatedType: 'order',
      };

      await notificationService.createNotification(data, t);

      await t.commit();
      return {
        success: true,
        message:
          order.paymentMethod === "VNPay"
            ? "Hoàn tiền và hủy đơn hàng thành công"
            : "Hủy đơn hàng thành công",
        order,
      };
    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error("Cancel Order error:", error);
      return { success: false, message: error.message || "Lỗi server khi hủy đơn hàng" };
    }
  },

  // Update order by Manager
  async updateManagerOrder(managerId, orderData) {
    const t = await db.sequelize.transaction();

    try {
      // 1. Lấy thông tin manager + office
      const manager = await db.Employee.findOne({
        where: { id: managerId, status: "Active" },
        include: [{ model: db.Office, as: "office" }],
        transaction: t,
      });

      if (!manager) {
        await t.rollback();
        return { success: false, message: "Manager không hợp lệ hoặc không hoạt động" };
      }

      // 2. Lấy order
      const existingOrder = await db.Order.findOne({
        where: { id: orderData.id },
        include: [
          { model: db.Office, as: "fromOffice" },
          { model: db.Office, as: "toOffice" },
          { model: db.User, as: "user" },
        ],
        transaction: t,
      });

      if (!existingOrder) {
        await t.rollback();
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      const { status } = existingOrder;

      // 3. Kiểm tra bưu cục có quyền
      const isFromOffice = manager.office.id === existingOrder.fromOfficeId;
      const isToOffice = manager.office.id === existingOrder.toOfficeId;

      if (!["confirmed", "picked_up", "in_transit"].includes(status)) {
        await t.rollback();
        return { success: false, message: "Không thể sửa đơn hàng ở trạng thái hiện tại" };
      }

      if (
        (["confirmed", "picked_up"].includes(status) && !isFromOffice) ||
        (status === "in_transit" && !isToOffice)
      ) {
        await t.rollback();
        return { success: false, message: "Bạn không có quyền sửa đơn hàng này" };
      }

      // 4. Xác định các field được phép sửa
      let allowedFields = [];
      switch (status) {
        case "confirmed":
          allowedFields = [
            "senderName", "senderPhone", "senderWardCode", "senderDetailAddress",
            "recipientName", "recipientPhone", "recipientWardCode", "recipientDetailAddress",
            "fromOfficeId", "toOfficeId", "notes"
          ];
          break;
        case "picked_up":
          allowedFields = [
            "recipientName", "recipientPhone", "recipientWardCode", "recipientDetailAddress",
            "toOfficeId", "notes"
          ];
          break;
        case "in_transit":
          allowedFields = [
            "recipientName", "recipientPhone", "recipientWardCode", "recipientDetailAddress",
            "notes"
          ];
          break;
      }

      // 5. Validate không cho đổi tỉnh
      if (orderData.senderCityCode && orderData.senderCityCode !== existingOrder.senderCityCode) {
        await t.rollback();
        return { success: false, message: "Không thể thay đổi tỉnh thành người gửi" };
      }
      if (orderData.recipientCityCode && orderData.recipientCityCode !== existingOrder.recipientCityCode) {
        await t.rollback();
        return { success: false, message: "Không thể thay đổi tỉnh thành người nhận" };
      }

      // 7. Chuẩn bị updateData
      const updateData = {};
      for (const key of allowedFields) {
        if (orderData[key] !== undefined) {
          updateData[key] = orderData[key];
        }
      }

      // 8. Cập nhật
      await db.Order.update(updateData, {
        where: { id: orderData.id },
        transaction: t,
      });

      // Gửi thông báo cho user
      const data = {
        title: `Cập nhật thông tin đơn hàng`,
        message: `Đơn hàng #${existingOrder.trackingNumber} đã được nhân viên bưu cục cập nhật thông tin. Nếu bạn không yêu cầu thay đổi này, vui lòng gửi Yêu cầu hỗ trợ hoặc Khiếu nại để được xử lý.`,
        type: 'order',
        userId: existingOrder.userId,
        targetRole: 'user',
        relatedId: existingOrder.id,
        relatedType: 'order',
      };
      await notificationService.createNotification(data, t);

      await t.commit();
      return { success: true, message: "Cập nhật đơn hàng thành công" };

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error("Update Manager Order error:", error);
      return { success: false, message: error.message || "Lỗi khi cập nhật đơn hàng" };
    }
  },

  async getShipmentOrders(managerId, shipmentId, page = 1, limit = 10, filters = {}) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Lấy manager và office
      const manager = await db.Employee.findOne({
        where: { id: managerId, status: "Active" },
        include: [{ model: db.Office, as: "office" }],
        transaction: t,
      });
      if (!manager) {
        await t.rollback();
        return { success: false, message: "Manager không hợp lệ hoặc không hoạt động" };
      }

      // 2. Lấy shipment kèm user -> employee -> office + shipmentOrders
      const shipment = await db.Shipment.findByPk(shipmentId, {
        include: [
          {
            model: db.User,
            as: "user",
            include: [
              {
                model: db.Employee,
                as: "employee",
                include: [{ model: db.Office, as: "office" }],
              },
            ],
          },
          {
            model: db.ShipmentOrder,
            as: "shipmentOrders",
            include: [{ model: db.Order, as: "order" }],
          },
        ],
        transaction: t,
      });

      if (!shipment) {
        await t.rollback();
        return { success: false, message: "Shipment không tồn tại" };
      }

      // 3. Lấy officeId của shipment thông qua user -> employee
      const shipmentOfficeId = shipment.user?.employee?.office?.id;

      // 4. Check quyền manager
      if (manager.id !== shipment.userId && manager.office?.id !== shipmentOfficeId) {
        await t.rollback();
        return { success: false, message: "Manager không có quyền xem shipment này" };
      }

      // 5. Build filters cho orders
      const { searchText, payer, paymentMethod, cod, sort } = filters;
      let orders = shipment.shipmentOrders.map((so) => so.order);

      if (searchText) {
        orders = orders.filter(
          (o) => o.trackingNumber.includes(searchText)
        );
      }
      if (payer && payer !== "All") {
        orders = orders.filter((o) => o.payer === payer);
      }
      if (paymentMethod && paymentMethod !== "All") {
        orders = orders.filter((o) => o.paymentMethod === paymentMethod);
      }
      if (cod && cod !== "All") {
        orders = orders.filter((o) =>
          cod === "Yes" ? o.cod > 0 : o.cod === 0
        );
      }

      // 6. Sort
      if (sort) {
        switch (sort) {
          case "codHigh": orders.sort((a, b) => b.cod - a.cod); break;
          case "codLow": orders.sort((a, b) => a.cod - b.cod); break;
          case "orderValueHigh": orders.sort((a, b) => b.orderValue - a.orderValue); break;
          case "orderValueLow": orders.sort((a, b) => a.orderValue - b.orderValue); break;
          case "feeHigh": orders.sort((a, b) => b.totalFee - a.totalFee); break;
          case "feeLow": orders.sort((a, b) => a.totalFee - b.totalFee); break;
          case "weightHigh": orders.sort((a, b) => b.weight - a.weight); break;
          case "weightLow": orders.sort((a, b) => a.weight - b.weight); break;
          default: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } else {
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // 7. Phân trang
      const total = orders.length;
      const offset = (page - 1) * limit;
      const pagedOrders = orders.slice(offset, offset + limit);

      await t.commit();

      return {
        success: true,
        message: "Lấy danh sách đơn hàng thành công",
        orders: pagedOrders,
        total,
        page,
        limit,
      };
    } catch (error) {
      await t.rollback();
      console.error("Get Orders by Shipment error:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng" };
    }
  },

  async getManagerOrdersDashboard(userId, startDate, endDate) {
    try {
      // 1️⃣ Lấy thông tin user và bưu cục
      const currentUser = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Employee,
            as: "employee",
            include: [{ model: db.Office, as: "office" }],
          },
        ],
      });

      if (!currentUser) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2️⃣ Kiểm tra quyền
      if (currentUser.role !== "manager" || currentUser.employee.status !== "Active") {
        return { success: false, message: "Người dùng không có quyền hoặc nhân viên không hoạt động" };
      }

      const officeId = currentUser.employee.office.id;

      // 3️⃣ Lọc theo ngày (nếu có)
      const whereCondition = {};
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereCondition.createdAt = { [db.Sequelize.Op.between]: [start, end] };
      }

      // 4️⃣ Trạng thái theo vai trò (loại bỏ draft và cancelled)
      const fromOfficeStatuses = ["pending", "confirmed", "picked_up", "in_transit", "returned"];
      const toOfficeStatuses = ["delivering", "delivered", "returning"];

      // 5️⃣ Lấy danh sách đơn thuộc bưu cục
      const orders = await db.Order.findAll({
        where: {
          ...whereCondition,
          [db.Sequelize.Op.or]: [
            { fromOfficeId: officeId, status: { [db.Sequelize.Op.in]: fromOfficeStatuses } },
            { toOfficeId: officeId, status: { [db.Sequelize.Op.in]: toOfficeStatuses } },
          ],
        },
        attributes: ["id", "status", "createdAt", "weight"],
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      // =============== 1️⃣ SUMMARY CARDS ===============
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) => o.status === "delivered").length;
      const returnedOrders = orders.filter((o) => o.status === "returned").length;
      const inTransitOrders = orders.filter((o) =>
        ["in_transit", "delivering"].includes(o.status)
      ).length;
      const totalWeight = orders.reduce((sum, o) => sum + (parseFloat(o.weight) || 0), 0);

      // 2️⃣ STATUS CHART (đếm theo status, loại bỏ draft và cancelled)
      const statusesEnum = db.Order.rawAttributes.status.values.filter(
        (s) => s !== "draft" && s !== "cancelled"
      );
      const statusMap = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      const statusChart = statusesEnum.map((status) => ({
        label: status,
        value: statusMap[status] || 0,
      }));

      // 3️⃣ ORDERS BY DATE (đếm số đơn theo ngày)
      const ordersByDateMap = {};

      for (const order of orders) {
        // Lấy ngày và set giờ về 00:00:00 để thống nhất
        const date = new Date(order.createdAt);
        date.setHours(0, 0, 0, 0);

        const timeKey = date.getTime(); // dùng timestamp làm key
        ordersByDateMap[timeKey] = (ordersByDateMap[timeKey] || 0) + 1;
      }

      // Chuyển sang mảng với date kiểu Date
      const ordersByDate = Object.entries(ordersByDateMap).map(([time, count]) => ({
        date: new Date(Number(time)), // convert lại thành Date
        count,
      }));

      // ✅ Trả kết quả đầy đủ
      return {
        success: true,
        message: "Lấy dữ liệu dashboard thành công",
        summary: {
          totalOrders,
          completedOrders,
          returnedOrders,
          inTransitOrders,
          totalWeight,
        },
        statusChart,
        ordersByDate,
      };
    } catch (error) {
      console.error("getManagerOrdersDashboardError:", error);
      return { success: false, message: "Lỗi server khi lấy đơn hàng dashboard" };
    }
  },

  // ===================== Admin ==================================/

  // Track Order
  async trackOrder(trackingNumber) {
    try {
      const order = await db.Order.findOne({
        where: { trackingNumber },
        include: [
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address', 'phoneNumber', 'type'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address', 'phoneNumber', 'type'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] },
          { model: db.OrderHistory, as: 'histories', attributes: ['id', 'action', ['note', 'notes'], ['actionTime', 'createdAt']] }
        ]
      });

      if (!order) {
        return { success: false, message: "Không tìm thấy đơn hàng với mã vận đơn này" };
      }

      return { success: true, data: order };
    } catch (error) {
      return { success: false, message: "Lỗi server khi tra cứu đơn hàng" };
    }
  },

  // Lấy thống kê cho shipper dashboard
  async getShipperStats(officeId, dateFrom, dateTo) {
    try {
      console.log('=== ORDER SERVICE: getShipperStats ===');
      console.log('Office ID:', officeId);
      console.log('Date From:', dateFrom);
      console.log('Date To:', dateTo);

      const where = {
        toOfficeId: officeId,
        createdByType: 'user' // Chỉ tính đơn hàng do user tạo, không tính đơn manager tạo tại bưu cục
      };

      // Chỉ thêm date filter nếu có giá trị
      if (dateFrom && dateTo) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        };
      }

      console.log('Where clause:', where);

      const [totalAssigned, inProgress, delivered, failed, codCollected] = await Promise.all([
        // Tổng đơn hàng đã hoàn thành (delivered, cancelled, returned)
        db.Order.count({
          where: {
            ...where,
            status: { [db.Sequelize.Op.in]: ['delivered', 'cancelled', 'returned'] }
          }
        }),
        // Đơn hàng đang trong quá trình giao (không có trong lịch sử)
        db.Order.count({
          where: {
            ...where,
            status: { [db.Sequelize.Op.in]: ['picked_up', 'in_transit'] }
          }
        }),
        // Đơn hàng đã giao thành công
        db.Order.count({
          where: {
            ...where,
            status: 'delivered'
          }
        }),
        // Đơn hàng giao thất bại (cancelled + returned)
        db.Order.count({
          where: {
            ...where,
            status: { [db.Sequelize.Op.in]: ['cancelled', 'returned'] }
          }
        }),
        // Tổng COD đã thu từ đơn hàng đã giao
        db.Order.sum('cod', {
          where: {
            ...where,
            status: 'delivered',
            cod: { [db.Sequelize.Op.gt]: 0 }
          }
        })
      ]);

      const result = {
        totalAssigned,
        inProgress,
        delivered,
        failed,
        codCollected: codCollected || 0
      };

      console.log('Stats result:', result);
      return result;
    } catch (error) {
      console.error('❌ Get shipper stats error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Lấy đơn hàng của shipper
  async getShipperOrders(filters) {
    try {
      console.log('=== ORDER SERVICE GET SHIPPER ORDERS START ===');
      console.log('Filters received:', filters);

      const {
        officeId,
        shipperUserId,
        page = 1,
        limit = 10,
        status,
        search,
        route,
        dateFrom,
        dateTo
      } = filters;

      const offset = (page - 1) * limit;
      const where = {
        toOfficeId: officeId,
        status: { [db.Sequelize.Op.in]: ['picked_up', 'delivering'] }, // Chỉ hiển thị đơn đã nhận và đang giao
        createdByType: 'user'
      };

      console.log('Base where clause:', where);

      if (status) where.status = status;
      if (search) {
        where[db.Sequelize.Op.or] = [
          { trackingNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientPhone: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
      }
      if (dateFrom && dateTo) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        };
      }

      console.log('Final where clause:', where);
      console.log('Query options:', {
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Hiển thị đơn theo status và office
      const { rows, count } = await db.Order.findAndCountAll({
        where: where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] },
        ],
        distinct: true,
      });

      console.log('Query result - count:', count);
      console.log('Query result - rows length:', rows.length);
      console.log('First order sample:', rows[0]);

      return {
        orders: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      };
    } catch (error) {
      console.error('=== ORDER SERVICE GET SHIPPER ORDERS ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Danh sách đơn chưa gán cho bất kỳ shipper nào (theo bưu cục)
  async listUnassignedOrders(filters) {
    try {
      console.log('=== ORDER SERVICE LIST UNASSIGNED START ===');
      console.log('Filters received:', filters);

      const {
        officeId,
        page = 1,
        limit = 10,
        status,
        search,
        dateFrom,
        dateTo
      } = filters;

      const offset = (page - 1) * limit;
      const where = {
        toOfficeId: officeId,
        status: 'arrived_at_office', // Chỉ lấy đơn hàng đã đến bưu cục đích
        createdByType: 'user' // Chỉ lấy đơn hàng do user tạo, không lấy đơn manager tạo tại bưu cục
      };

      if (status) where.status = status;
      if (search) {
        where[db.Sequelize.Op.or] = [
          { trackingNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientPhone: { [db.Sequelize.Op.like]: `%${search}%` } }
        ];
      }
      if (dateFrom && dateTo) {
        where.createdAt = { [db.Sequelize.Op.between]: [dateFrom, dateTo] };
      }

      // Chỉ loại trừ những đơn đã được shipper nhận (picked_up, delivering)
      // Không loại trừ đơn chỉ được driver vận chuyển (arrived_at_office)
      const unassignedWhere = {
        ...where,
        status: 'arrived_at_office' // Chỉ lấy đơn đã đến bưu cục và chưa được shipper nhận
      };

      console.log('Unassigned where clause:', unassignedWhere);

      // Debug: Kiểm tra query đơn giản trước
      const simpleQuery = await db.Order.findAll({
        where: {
          toOfficeId: officeId,
          status: 'arrived_at_office',
          createdByType: 'user'
        }
      });
      console.log('Simple query (before NOT filter) found:', simpleQuery.length);

      console.log('Final unassigned query - no ShipmentOrder filtering needed');

      const { rows, count } = await db.Order.findAndCountAll({
        where: unassignedWhere,
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        distinct: true,
      });

      console.log('Unassigned orders found:', rows.length);
      console.log('Total count:', count);

      return {
        orders: rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total: count }
      };
    } catch (error) {
      console.error('=== ORDER SERVICE LIST UNASSIGNED ERROR ===');
      console.error('Error details:', error);
      throw error;
    }
  },

  // Shipper nhận đơn: cập nhật status từ arrived_at_office → picked_up
  async claimOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      console.log('=== ORDER SERVICE CLAIM START ===', { userId, orderId });

      const order = await db.Order.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return { success: false, message: 'Đơn hàng không tồn tại' };
      }

      // Kiểm tra đơn phải ở trạng thái arrived_at_office
      if (order.status !== 'arrived_at_office') {
        await t.rollback();
        return { success: false, message: 'Đơn hàng không ở trạng thái có thể nhận' };
      }

      // Cập nhật status thành picked_up
      await order.update({ status: 'picked_up' }, { transaction: t });

      // Ghi lịch sử
      await db.OrderHistory.create({
        orderId: order.id,
        fromOfficeId: order.fromOfficeId || null,
        toOfficeId: order.toOfficeId || null,
        shipmentId: null, // Không liên quan đến shipment của driver
        action: 'PickedUp',
        note: `Shipper ${userId} đã nhận đơn để giao`,
        actionTime: new Date()
      }, { transaction: t });

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error('=== ORDER SERVICE CLAIM ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Lỗi khi nhận đơn' };
    }
  },

  // Bỏ nhận đơn: chỉ cho phép nếu shipment của shipper và shipment còn Pending
  async unclaimOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      console.log('=== ORDER SERVICE UNCLAIM START ===', { userId, orderId });

      const link = await db.ShipmentOrder.findOne({
        where: { orderId },
        include: [{ model: db.Shipment, as: 'shipment', where: { userId }, attributes: ['id', 'status'] }],
        transaction: t
      });

      if (!link) {
        await t.rollback();
        return { success: false, message: 'Không tìm thấy gán đơn thuộc shipper' };
      }

      const shipment = await db.Shipment.findByPk(link.shipmentId, { transaction: t });
      if (!shipment || shipment.status !== 'Pending') {
        await t.rollback();
        return { success: false, message: 'Chỉ bỏ nhận khi chuyến đang ở trạng thái Pending' };
      }

      await link.destroy({ transaction: t });
      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error('=== ORDER SERVICE UNCLAIM ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Lỗi khi bỏ nhận đơn' };
    }
  },

  async getShipperDeliveryHistory(filters) {
    try {
      console.log('=== ORDER SERVICE: getShipperDeliveryHistory ===');
      console.log('Filters received:', filters);

      const { officeId, page = 1, limit = 10, status, dateFrom, dateTo } = filters;
      const offset = (page - 1) * limit;

      // Chỉ lấy đơn hàng có trạng thái đã giao, thất bại, hoàn hàng
      const where = {
        toOfficeId: officeId,
        status: { [db.Sequelize.Op.in]: ['delivered', 'cancelled', 'returned'] }
      };

      // Nếu có filter status cụ thể, override
      if (status) where.status = status;
      if (dateFrom && dateTo) {
        where.createdAt = { [db.Sequelize.Op.between]: [dateFrom, dateTo] };
      }

      const queryOptions = {
        where,
        limit: parseInt(limit),
        offset,
        order: [['deliveredAt', 'DESC'], ['createdAt', 'DESC']],
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] }
        ]
      };

      console.log('Query options:', queryOptions);

      const { rows, count } = await db.Order.findAndCountAll(queryOptions);

      console.log('History query result - count:', count);
      rows.forEach(order => {
        console.log(`Order: ${order.trackingNumber} | Status: ${order.status} | DeliveredAt: ${order.deliveredAt}`);
      });

      // Tính thống kê
      const stats = await this.getShipperStats(officeId, dateFrom, dateTo);
      console.log('Stats:', stats);

      const result = { orders: rows, pagination: { page: parseInt(page), limit: parseInt(limit), total: count }, stats };
      console.log('History result:', result);

      return result;
    } catch (error) {
      console.error('❌ Get shipper delivery history error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Lấy lộ trình giao hàng
  async getShipperRoute(officeId, dateFrom, dateTo, shipperUserId = null) {
    try {
      console.log('=== ORDER SERVICE: getShipperRoute ===');
      console.log('Office ID:', officeId);
      console.log('Date From:', dateFrom);
      console.log('Date To:', dateTo);
      console.log('Shipper User ID:', shipperUserId);

      const where = {
        toOfficeId: officeId,
        status: { [db.Sequelize.Op.in]: ['arrived_at_office', 'picked_up', 'delivering'] },
        createdByType: 'user' // Chỉ lấy đơn hàng do user tạo, không lấy đơn manager tạo tại bưu cục
      };

      console.log('Where clause:', where);

      const orders = await db.Order.findAll({
        where: where,
        order: [['createdAt', 'ASC']],
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] }
        ]
      });

      console.log('Route orders found:', orders.length);

      // Lấy thông tin bưu cục để có tọa độ xuất phát
      const office = await db.Office.findByPk(officeId);
      const startCoordinates = {
        latitude: parseFloat(office?.latitude) || 10.7769,
        longitude: parseFloat(office?.longitude) || 106.7009
      };

      // Tính toán thông tin tuyến với khoảng cách thực tế
      let totalDistance = 0;
      let estimatedDuration = 0;

      // Tạo danh sách các điểm giao hàng với tọa độ
      const deliveryPoints = orders.map((order, index) => {
        const recipientCoordinates = this.getCoordinatesFromCityCode(
          order.recipientCityCode,
          index,
          order.recipientDetailAddress || ''
        );
        return {
          order,
          coordinates: recipientCoordinates,
          index
        };
      });

      // Sắp xếp các điểm giao hàng theo khoảng cách từ bưu cục (gần nhất trước)
      deliveryPoints.sort((a, b) => {
        const distanceA = calculateDistance(
          startCoordinates.latitude,
          startCoordinates.longitude,
          a.coordinates.latitude,
          a.coordinates.longitude
        );
        const distanceB = calculateDistance(
          startCoordinates.latitude,
          startCoordinates.longitude,
          b.coordinates.latitude,
          b.coordinates.longitude
        );
        return distanceA - distanceB;
      });

      // Tính toán khoảng cách và thời gian cho từng điểm dừng
      const deliveryStops = deliveryPoints.map((point, index) => {
        let distanceFromPrevious = 0;
        let travelTimeFromPrevious = 0;

        if (index === 0) {
          // Điểm đầu tiên: tính từ bưu cục
          distanceFromPrevious = calculateDistance(
            startCoordinates.latitude,
            startCoordinates.longitude,
            point.coordinates.latitude,
            point.coordinates.longitude
          );
        } else {
          // Các điểm tiếp theo: tính từ điểm trước đó
          const previousPoint = deliveryPoints[index - 1];
          distanceFromPrevious = calculateDistance(
            previousPoint.coordinates.latitude,
            previousPoint.coordinates.longitude,
            point.coordinates.latitude,
            point.coordinates.longitude
          );
        }

        // Tính thời gian di chuyển (sử dụng xe máy cho shipper trong thành phố)
        travelTimeFromPrevious = calculateTravelTime(distanceFromPrevious, 'Motorcycle'); // Sử dụng xe máy cho shipper

        totalDistance += distanceFromPrevious;
        estimatedDuration += travelTimeFromPrevious;

        return {
          id: point.order.id,
          trackingNumber: point.order.trackingNumber,
          recipientName: point.order.recipientName,
          recipientPhone: point.order.recipientPhone,
          recipientAddress: point.order.recipientDetailAddress ?
            point.order.recipientDetailAddress.replace(/,\s*\d+,\s*\d+$/, '') : '',
          codAmount: point.order.cod,
          priority: point.order.cod > 1000000 ? 'urgent' : 'normal',
          serviceType: point.order.serviceType?.name || 'Tiêu chuẩn',
          estimatedTime: `${travelTimeFromPrevious} phút`,
          status: point.order.status === 'delivered' ? 'completed' :
            (point.order.status === 'delivering' || point.order.status === 'picked_up') ? 'in_progress' : 'pending',
          coordinates: {
            lat: point.coordinates.latitude,
            lng: point.coordinates.longitude
          },
          distance: Math.round(distanceFromPrevious * 100) / 100,
          travelTime: travelTimeFromPrevious,
          distanceFromPrevious: Math.round(distanceFromPrevious * 100) / 100,
          travelTimeFromPrevious: travelTimeFromPrevious
        };
      });

      const totalCOD = orders.reduce((sum, order) => sum + (order.cod || 0), 0);

      return {
        routeInfo: {
          id: 1,
          name: `Tuyến ${officeId}`,
          startLocation: office?.address || 'Bưu cục',
          totalStops: orders.length,
          completedStops: orders.filter(o => o.status === 'delivered').length,
          totalDistance: Math.round(totalDistance * 100) / 100,
          estimatedDuration: Math.round(estimatedDuration),
          totalCOD,
          status: 'not_started'
        },
        deliveryStops
      };
    } catch (error) {
      console.error('❌ Get shipper route error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Lấy giao dịch COD của shipper
  async getShipperCODTransactions(filters) {
    try {
      console.log('=== ORDER SERVICE: getShipperCODTransactions ===');
      console.log('Filters received:', filters);

      const {
        officeId,
        shipperId,
        page = 1,
        limit = 10,
        status,
        dateFrom,
        dateTo
      } = filters;

      const offset = (page - 1) * limit;
      const where = {
        status: 'delivered', // Chỉ lấy đơn hàng đã giao
        toOfficeId: officeId
      };

      if (dateFrom && dateTo) {
        where.deliveredAt = {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        };
      }

      // Chuẩn bị include với filter shipperId nếu có
      const include = [
        { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
        { model: db.Office, as: 'fromOffice', attributes: ['id', 'name'] },
        { model: db.Office, as: 'toOffice', attributes: ['id', 'name'] },
        {
          model: db.ShippingCollection,
          as: 'shippingCollections',
          required: false, // LEFT JOIN để lấy cả đơn chưa thu tiền
          attributes: ['id', 'shipperId', 'amountCollected', 'discrepancy', 'notes', 'createdAt'],
          include: [{
            model: db.User,
            as: 'shipper',
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
          }]
        }
      ];

      // Nếu có filter theo shipperId, thêm điều kiện vào ShippingCollection
      if (shipperId) {
        include[3].where = { shipperId: shipperId };
        include[3].required = true; // INNER JOIN để chỉ lấy đơn của shipper này
      }

      console.log('COD where clause:', where);

      const { rows, count } = await db.Order.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['deliveredAt', 'DESC']],
        include
      });

      // Lấy thông tin PaymentSubmission riêng biệt
      const orderIds = rows.map(order => order.id);

      // Query tất cả PaymentSubmission và filter trong JavaScript
      let paymentSubmissions = [];
      if (orderIds.length > 0) {
        paymentSubmissions = await db.PaymentSubmission.findAll({
          attributes: ['id', 'totalAmountSubmitted', 'status', 'createdAt', 'orderIds']
        });

        // Filter chỉ những submission có chứa orderIds cần thiết
        paymentSubmissions = paymentSubmissions.filter(submission => {
          if (submission.orderIds && Array.isArray(submission.orderIds)) {
            return submission.orderIds.some(orderId => orderIds.includes(orderId));
          }
          return false;
        });
      }

      // Map payment submissions to orders
      const orderPaymentMap = {};
      paymentSubmissions.forEach(submission => {
        if (submission.orderIds && Array.isArray(submission.orderIds)) {
          submission.orderIds.forEach(orderId => {
            if (!orderPaymentMap[orderId]) {
              orderPaymentMap[orderId] = [];
            }
            orderPaymentMap[orderId].push(submission);
          });
        }
      });

      // Add payment submissions to orders
      rows.forEach(order => {
        order.paymentSubmissions = orderPaymentMap[order.id] || [];
      });

      // Debug: Log all orders to see what we're getting
      console.log('=== COD TRANSACTIONS DEBUG ===');
      console.log('Total count from query:', count);
      console.log('Rows returned:', rows.length);
      if (rows.length > 0) {
        console.log('First order sample:', {
          id: rows[0].id,
          trackingNumber: rows[0].trackingNumber,
          cod: rows[0].cod,
          status: rows[0].status,
          toOfficeId: rows[0].toOfficeId,
          shippingCollections: rows[0].shippingCollections
        });
      } else {
        console.log('No orders found with current filters');
        // Let's check if there are any orders at all for this office
        const allOrders = await db.Order.findAll({
          where: { toOfficeId: officeId },
          attributes: ['id', 'trackingNumber', 'cod', 'status'],
          limit: 5
        });
        console.log('Sample orders for this office:', allOrders);
      }

      console.log('COD query result - count:', count);
      console.log('COD query result - rows length:', rows.length);

      // Tính tổng kết dựa trên ShippingCollection và PaymentSubmission
      console.log('Calculating summary for COD transactions...');

      let totalCollected = 0;
      let totalSubmitted = 0;
      let totalPending = 0;

      rows.forEach((order, index) => {
        const codAmount = order.cod || 0;
        const hasCollection = order.shippingCollections && order.shippingCollections.length > 0;
        const hasSubmission = order.paymentSubmissions && order.paymentSubmissions.length > 0;

        // Chỉ tính các đơn hàng có COD > 0
        if (codAmount > 0) {
          if (hasCollection) {
            totalCollected += codAmount;
          }

          if (hasSubmission) {
            totalSubmitted += codAmount;
          } else if (hasCollection) {
            totalPending += codAmount;
          }
        }

        console.log(`Order ${index + 1}: ID=${order.id}, COD=${codAmount}, Collected=${hasCollection}, Submitted=${hasSubmission}`);
      });

      const summary = {
        totalCollected,
        totalSubmitted,
        totalPending,
        transactionCount: count
      };

      console.log('COD Summary calculated:', summary);

      // Format transactions với trạng thái đúng
      const formattedTransactions = rows.map(order => {
        const codAmount = order.cod || 0;
        const hasCollection = order.shippingCollections && order.shippingCollections.length > 0;
        const hasSubmission = order.paymentSubmissions && order.paymentSubmissions.length > 0;

        let status = 'pending'; // Mặc định là chờ thu

        // Nếu đơn hàng không có COD, luôn hiển thị là "delivered"
        if (codAmount === 0) {
          status = 'delivered';
        } else {
          // Chỉ áp dụng logic COD cho đơn hàng có COD > 0
          if (hasSubmission) {
            status = 'submitted'; // Đã nộp
          } else if (hasCollection) {
            status = 'collected'; // Đã thu
          }
        }

        return {
          id: order.id,
          trackingNumber: order.trackingNumber,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          codAmount: codAmount,
          status: status,
          collectedAt: hasCollection ? order.shippingCollections[0].createdAt : null,
          submittedAt: hasSubmission ? order.paymentSubmissions[0].createdAt : null,
          notes: hasCollection ? order.shippingCollections[0].notes : null,
          shipper: hasCollection && order.shippingCollections[0].shipper ? {
            id: order.shippingCollections[0].shipper.id,
            name: `${order.shippingCollections[0].shipper.firstName} ${order.shippingCollections[0].shipper.lastName}`,
            phone: order.shippingCollections[0].shipper.phoneNumber
          } : null
        };
      });

      const result = {
        transactions: formattedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        },
        summary
      };

      console.log('COD result:', result);
      return result;
    } catch (error) {
      console.error('❌ Get shipper COD transactions error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },

  // Helper methods
  calculateEstimatedTime(index) {
    const baseTime = 8; // 8:00 AM
    const timePerOrder = 1; // 1 hour per order
    const hour = baseTime + (index * timePerOrder);
    return `${hour.toString().padStart(2, '0')}:00`;
  },

  // Generate real coordinates based on district/city
  generateRealCoordinates(wardCode, cityCode, index) {
    // Base coordinates for Ho Chi Minh City
    const baseLat = 10.8231;
    const baseLng = 106.6297;

    // Add some variation based on ward and index
    const latOffset = (parseInt(wardCode) || 1) * 0.01 + (index * 0.005);
    const lngOffset = (parseInt(cityCode) || 79) * 0.001 + (index * 0.003);

    return {
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset
    };
  },

  async createOrder(orderData) {
    try {
      console.log('=== ORDER SERVICE CREATE ORDER START ===');
      console.log('Order data:', orderData);

      const t = await db.sequelize.transaction();

      try {
        // Generate tracking number
        const trackingNumber = 'DH' + Date.now().toString().slice(-8);

        // Create order
        const order = await db.Order.create({
          trackingNumber,
          senderName: orderData.senderName,
          senderPhone: orderData.senderPhone,
          recipientName: orderData.recipientName,
          recipientPhone: orderData.recipientPhone,
          cityCode: orderData.senderAddress?.codeCity,
          wardCode: orderData.senderAddress?.codeWard,
          detailAddress: orderData.senderAddress?.detailAddress,
          weight: orderData.weight,
          serviceTypeId: orderData.serviceTypeId,
          userId: orderData.userId,
          promotionId: orderData.promotionId,
          discountAmount: orderData.discountAmount || 0,
          shippingFee: orderData.shippingFee,
          orderValue: orderData.orderValue || 0,
          cod: orderData.cod || 0,
          payer: orderData.payer || 'Customer',
          paymentMethod: orderData.paymentMethod || 'Cash',
          notes: orderData.notes || '',
          status: 'pending'
        }, { transaction: t });

        // If promotion is applied, increment used count
        if (orderData.promotionId) {
          await db.Promotion.increment('usedCount', {
            where: { id: orderData.promotionId },
            transaction: t
          });
        }

        // Create initial order history
        await db.OrderHistory.create({
          orderId: order.id,
          action: 'ReadyForPickup',
          note: 'Đơn hàng được tạo',
          actionTime: new Date()
        }, { transaction: t });

        await t.commit();

        console.log('Order created successfully:', order.id);
        return { success: true, data: order };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('=== ORDER SERVICE CREATE ORDER ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Lỗi khi tạo đơn hàng' };
    }
  },

  // Submit COD payment to office
  async submitCODPayment(submissionData) {
    const t = await db.sequelize.transaction();
    try {
      console.log('=== ORDER SERVICE SUBMIT COD PAYMENT START ===');
      console.log('Submission data:', submissionData);

      const { orderId, officeId, shipperId, amountSubmitted, notes } = submissionData;

      // Get order details
      const order = await db.Order.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return { success: false, message: 'Không tìm thấy đơn hàng' };
      }

      // Get expected amount (COD + shipping fee - discount)
      const expectedAmount = order.cod + order.shippingFee - order.discountAmount;

      // Calculate discrepancy
      const discrepancy = amountSubmitted - expectedAmount;

      // Create payment submission record
      const paymentSubmission = await db.PaymentSubmission.create({
        orderId,
        officeId,
        shipperId,
        amountSubmitted,
        discrepancy,
        status: 'Pending',
        notes: notes || `Shipper nộp tiền COD cho đơn hàng ${order.trackingNumber}`
      }, { transaction: t });

      await t.commit();

      console.log('COD payment submitted successfully:', paymentSubmission.id);
      return {
        success: true,
        data: paymentSubmission,
        expectedAmount,
        discrepancy
      };
    } catch (error) {
      await t.rollback();
      console.error('=== ORDER SERVICE SUBMIT COD PAYMENT ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Lỗi khi nộp tiền COD' };
    }
  },

  // Get COD reconciliation data for office
  async getCODReconciliation(filters) {
    try {
      console.log('=== ORDER SERVICE GET COD RECONCILIATION START ===');
      console.log('Filters:', filters);

      const { officeId, page = 1, limit = 20, dateFrom, dateTo, status } = filters;
      const offset = (page - 1) * limit;

      const where = { officeId };
      if (dateFrom && dateTo) {
        where.createdAt = { [db.Sequelize.Op.between]: [dateFrom, dateTo] };
      }
      if (status) where.status = status;

      const { rows, count } = await db.PaymentSubmission.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.Order, as: 'order', attributes: ['id', 'trackingNumber', 'cod', 'shippingFee', 'discountAmount'] },
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
          { model: db.Office, as: 'office', attributes: ['id', 'name'] }
        ]
      });

      // Calculate summary
      const summary = {
        totalSubmitted: rows.reduce((sum, record) => sum + record.amountSubmitted, 0),
        totalExpected: rows.reduce((sum, record) => {
          const order = record.order;
          return sum + (order.cod + order.shippingFee - order.discountAmount);
        }, 0),
        totalDiscrepancy: rows.reduce((sum, record) => sum + record.discrepancy, 0),
        pendingCount: rows.filter(r => r.status === 'Pending').length,
        confirmedCount: rows.filter(r => r.status === 'Confirmed').length,
        adjustedCount: rows.filter(r => r.status === 'Adjusted').length,
        rejectedCount: rows.filter(r => r.status === 'Rejected').length
      };

      return {
        success: true,
        data: {
          records: rows,
          pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
          summary
        }
      };
    } catch (error) {
      console.error('=== ORDER SERVICE GET COD RECONCILIATION ERROR ===');
      console.error('Error details:', error);
      return { success: false, message: 'Lỗi khi lấy dữ liệu đối soát COD' };
    }
  },

  // Helper function to get coordinates from city code and address
  getCoordinatesFromCityCode(cityCode, index = 0, detailAddress = '') {
    // Mapping of major city codes to their approximate coordinates
    const cityCoordinates = {
      // Hồ Chí Minh
      79: { latitude: 10.7769, longitude: 106.7009 },
      // Hà Nội
      1: { latitude: 21.0285, longitude: 105.8542 },
      // Đà Nẵng
      48: { latitude: 16.0544, longitude: 108.2022 },
      // Cần Thơ
      92: { latitude: 10.0452, longitude: 105.7469 },
      // Hải Phòng
      31: { latitude: 20.8449, longitude: 106.6881 },
      // An Giang
      89: { latitude: 10.5216, longitude: 105.1259 },
      // Bà Rịa - Vũng Tàu
      77: { latitude: 10.3464, longitude: 107.0843 },
      // Bắc Giang
      24: { latitude: 21.2739, longitude: 106.1946 },
      // Bắc Kạn
      6: { latitude: 22.1470, longitude: 105.8348 },
      // Bạc Liêu
      95: { latitude: 9.2945, longitude: 105.7272 },
      // Bắc Ninh
      27: { latitude: 21.1862, longitude: 106.0763 },
      // Bến Tre
      83: { latitude: 10.2434, longitude: 106.3758 },
      // Bình Định
      52: { latitude: 13.7750, longitude: 109.2233 },
      // Bình Dương
      74: { latitude: 11.3254, longitude: 106.4774 },
      // Bình Phước
      70: { latitude: 11.6471, longitude: 106.6056 },
      // Bình Thuận
      60: { latitude: 10.9289, longitude: 108.1021 },
      // Cà Mau
      96: { latitude: 9.1768, longitude: 105.1520 },
      // Cao Bằng
      4: { latitude: 22.6657, longitude: 106.2570 },
      // Đắk Lắk
      66: { latitude: 12.6667, longitude: 108.0500 },
      // Đắk Nông
      67: { latitude: 12.0047, longitude: 107.6877 },
      // Điện Biên
      11: { latitude: 21.4064, longitude: 103.0078 },
      // Đồng Nai
      75: { latitude: 11.0686, longitude: 106.6536 },
      // Đồng Tháp
      87: { latitude: 10.5604, longitude: 105.6320 },
      // Gia Lai
      64: { latitude: 13.8079, longitude: 108.2204 },
      // Hà Giang
      3: { latitude: 22.7662, longitude: 104.9833 },
      // Hà Nam
      35: { latitude: 20.5431, longitude: 105.9229 },
      // Hà Tĩnh
      42: { latitude: 18.3370, longitude: 105.9055 },
      // Hải Dương
      30: { latitude: 20.9371, longitude: 106.3207 },
      // Hậu Giang
      93: { latitude: 9.7842, longitude: 105.4701 },
      // Hòa Bình
      17: { latitude: 20.6861, longitude: 105.3136 },
      // Hưng Yên
      33: { latitude: 20.6563, longitude: 106.0513 },
      // Khánh Hòa
      56: { latitude: 12.2388, longitude: 109.1967 },
      // Kiên Giang
      91: { latitude: 9.8240, longitude: 105.1259 },
      // Kon Tum
      62: { latitude: 14.3547, longitude: 108.0075 },
      // Lai Châu
      12: { latitude: 22.3867, longitude: 103.4543 },
      // Lâm Đồng
      68: { latitude: 11.9404, longitude: 108.4583 },
      // Lạng Sơn
      20: { latitude: 21.8537, longitude: 106.7613 },
      // Lào Cai
      10: { latitude: 22.3406, longitude: 103.9000 },
      // Long An
      80: { latitude: 10.6086, longitude: 106.6714 },
      // Nam Định
      36: { latitude: 20.4388, longitude: 106.1621 },
      // Nghệ An
      40: { latitude: 18.6792, longitude: 105.6882 },
      // Ninh Bình
      37: { latitude: 20.2506, longitude: 105.9744 },
      // Ninh Thuận
      58: { latitude: 11.5648, longitude: 108.9881 },
      // Phú Thọ
      25: { latitude: 21.3087, longitude: 105.2046 },
      // Phú Yên
      54: { latitude: 13.0883, longitude: 109.0929 },
      // Quảng Bình
      44: { latitude: 17.4683, longitude: 106.6227 },
      // Quảng Nam
      49: { latitude: 15.8801, longitude: 108.3380 },
      // Quảng Ngãi
      51: { latitude: 15.1214, longitude: 108.8044 },
      // Quảng Ninh
      22: { latitude: 21.0064, longitude: 107.2925 },
      // Quảng Trị
      45: { latitude: 16.7500, longitude: 107.2000 },
      // Sóc Trăng
      94: { latitude: 9.6002, longitude: 105.9804 },
      // Sơn La
      14: { latitude: 21.3257, longitude: 103.9180 },
      // Tây Ninh
      72: { latitude: 11.3131, longitude: 106.0963 },
      // Thái Bình
      34: { latitude: 20.4465, longitude: 106.3421 },
      // Thái Nguyên
      19: { latitude: 21.5944, longitude: 105.8481 },
      // Thanh Hóa
      38: { latitude: 19.8067, longitude: 105.7844 },
      // Thừa Thiên Huế
      46: { latitude: 16.4637, longitude: 107.5909 },
      // Tiền Giang
      82: { latitude: 10.3600, longitude: 106.3600 },
      // Trà Vinh
      84: { latitude: 9.9347, longitude: 106.3431 },
      // Tuyên Quang
      8: { latitude: 21.8189, longitude: 105.2116 },
      // Vĩnh Long
      86: { latitude: 10.2400, longitude: 105.9600 },
      // Vĩnh Phúc
      26: { latitude: 21.3089, longitude: 105.6049 },
      // Yên Bái
      15: { latitude: 21.7167, longitude: 104.9000 }
    };

    // Get base coordinates for the city
    const baseCoords = cityCoordinates[cityCode];
    if (!baseCoords) {
      // Default coordinates (Hồ Chí Minh) with offset
      return {
        latitude: 10.7769 + (index * 0.01),
        longitude: 106.7009 + (index * 0.01)
      };
    }

    // Generate variation based on address details and index
    let latOffset = 0;
    let lngOffset = 0;

    if (detailAddress) {
      // Create deterministic offset based on address string
      const addressHash = detailAddress.split('').reduce((hash, char) => {
        return hash + char.charCodeAt(0);
      }, 0);

      // Generate offsets within city bounds (±0.05 degrees ≈ ±5.5km)
      latOffset = ((addressHash % 100) - 50) / 1000; // ±0.05
      lngOffset = (((addressHash >> 8) % 100) - 50) / 1000; // ±0.05
    }

    // Add index-based offset for multiple orders
    latOffset += (index * 0.001);
    lngOffset += (index * 0.001);

    return {
      latitude: baseCoords.latitude + latOffset,
      longitude: baseCoords.longitude + lngOffset
    };
  }
};

export default orderService;