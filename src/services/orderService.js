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
      console.log('=== ORDER SERVICE GET ORDER BY ID START ===', { orderId });
      const order = await db.Order.findByPk(orderId, {
        include: [
          { model: db.User, as: 'user', attributes: ['id','firstName','lastName','email','phoneNumber','role'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id','name','address','phoneNumber','type','status'] },
          { model: db.Office, as: 'toOffice', attributes: ['id','name','address','phoneNumber','type','status'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id','name','deliveryTime','status'] },
          { model: db.Product, as: 'products', attributes: ['id','name','weight','type','status'], through: { attributes: ['quantity'] } },
          { model: db.OrderHistory, as: 'histories', attributes: ['id','status','note','actionTime'] }
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
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        return { success: false, message: "Không tìm thấy đơn hàng" };
      }

      // Optional access check: order must belong to shipper's office
      if (officeId && order.toOfficeId !== Number(officeId)) {
        return { success: false, message: 'Đơn không thuộc bưu cục của bạn' };
      }

      // Only allow specific fields to be updated safely
      const nextStatus = updateData?.status;
      if (typeof nextStatus === 'string' && nextStatus.length > 0) {
        order.status = nextStatus;
      }

      // deliveredAt when delivered
      if (nextStatus === 'delivered') {
        order.deliveredAt = new Date();
      }

      // Persist
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

  async trackOrder(trackingNumber) {
    try {
      const order = await db.Order.findOne({
        where: { trackingNumber },
        include: [
          { model: db.Office, as: 'fromOffice', attributes: ['id','name','address','phoneNumber','type'] },
          { model: db.Office, as: 'toOffice', attributes: ['id','name','address','phoneNumber','type'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id','name','deliveryTime'] },
          { model: db.OrderHistory, as: 'histories', attributes: ['id', 'status', ['note','notes'], ['actionTime','createdAt']] }
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

  // ========== SHIPPER METHODS ==========

  // Lấy thống kê cho shipper dashboard
  async getShipperStats(officeId, dateFrom, dateTo) {
    try {
      console.log('=== ORDER SERVICE: getShipperStats ===');
      console.log('Office ID:', officeId);
      console.log('Date From:', dateFrom);
      console.log('Date To:', dateTo);
      
      const where = {
        toOfficeId: officeId,
        createdAt: {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        }
      };
      console.log('Where clause:', where);

      const [totalAssigned, inProgress, delivered, failed, codCollected] = await Promise.all([
        db.Order.count({ where }),
        db.Order.count({ where: { ...where, status: 'in_transit' } }),
        db.Order.count({ where: { ...where, status: 'delivered' } }),
        db.Order.count({ where: { ...where, status: 'cancelled' } }),
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
        toOfficeId: officeId
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

      // Nếu có shipperUserId: chỉ lấy đơn đã gán cho shipper hiện tại bằng EXISTS
      let whereWithAssigned = { ...where };
      if (shipperUserId !== undefined && shipperUserId !== null) {
        const userIdNum = Number(shipperUserId);
        if (!Number.isNaN(userIdNum)) {
          const assignedExists = db.Sequelize.where(
            db.Sequelize.literal(
              `EXISTS (SELECT 1 FROM ShipmentOrders so JOIN Shipments sh ON sh.id = so.shipmentId AND sh.userId = ${userIdNum} WHERE so.orderId = \`Order\`.id)`
            ),
            true
          );
          whereWithAssigned = {
            ...whereWithAssigned,
            [db.Sequelize.Op.and]: [assignedExists],
          };
        }
      }

      const { rows, count } = await db.Order.findAndCountAll({
        where: whereWithAssigned,
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
      const where = { toOfficeId: officeId };

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

      // Sử dụng subquery để tìm orders không có trong ShipmentOrder
      const unassignedWhere = {
        ...where,
        [db.Sequelize.Op.not]: {
          id: {
            [db.Sequelize.Op.in]: db.Sequelize.literal(
              '(SELECT DISTINCT orderId FROM ShipmentOrders WHERE orderId IS NOT NULL)'
            )
          }
        }
      };

      console.log('Unassigned where clause:', unassignedWhere);

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

  // Shipper nhận đơn: tạo Shipment (nếu chưa có) và gán order vào ShipmentOrder
  async claimOrder(userId, orderId) {
    const t = await db.sequelize.transaction();
    try {
      console.log('=== ORDER SERVICE CLAIM START ===', { userId, orderId });

      const order = await db.Order.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return { success: false, message: 'Đơn hàng không tồn tại' };
      }

      // Kiểm tra đã được gán chưa
      const existingLink = await db.ShipmentOrder.findOne({ where: { orderId }, transaction: t });
      if (existingLink) {
        await t.rollback();
        return { success: false, message: 'Đơn đã được gán' };
      }

      // Tìm Shipment đang hoạt động của shipper
      let shipment = await db.Shipment.findOne({
        where: { userId, status: { [db.Sequelize.Op.in]: ['Pending', 'InTransit'] } },
        transaction: t
      });

      if (!shipment) {
        shipment = await db.Shipment.create({ userId, status: 'Pending', startTime: new Date() }, { transaction: t });
      }

      await db.ShipmentOrder.create({ shipmentId: shipment.id, orderId }, { transaction: t });

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

  // Lấy lịch sử giao hàng của shipper
  async getShipperDeliveryHistory(filters) {
    try {
      console.log('=== ORDER SERVICE: getShipperDeliveryHistory ===');
      console.log('Filters received:', filters);
      
      const { 
        officeId, 
        page = 1, 
        limit = 10, 
        status, 
        dateFrom,
        dateTo,
        route 
      } = filters;
      
      const offset = (page - 1) * limit;
      const where = {
        toOfficeId: officeId
      };

      if (status) where.status = status;
      if (dateFrom && dateTo) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        };
      }
      
      console.log('Where clause:', where);

      const { rows, count } = await db.Order.findAndCountAll({
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
      });

      console.log('History query result - count:', count);
      console.log('History query result - rows length:', rows.length);

      // Tính thống kê
      const stats = await this.getShipperStats(officeId, dateFrom, dateTo);

      const result = {
        orders: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        },
        stats
      };
      
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
        status: { [db.Sequelize.Op.in]: ['confirmed', 'picked_up', 'in_transit'] }
      };

      // Nếu có shipperUserId: chỉ lấy đơn đã gán cho shipper hiện tại
      let whereWithAssigned = { ...where };
      if (shipperUserId !== undefined && shipperUserId !== null) {
        const userIdNum = Number(shipperUserId);
        if (!Number.isNaN(userIdNum)) {
          const assignedExists = db.Sequelize.where(
            db.Sequelize.literal(
              `EXISTS (SELECT 1 FROM ShipmentOrders so JOIN Shipments sh ON sh.id = so.shipmentId AND sh.userId = ${userIdNum} WHERE so.orderId = \`Order\`.id)`
            ),
            true
          );
          whereWithAssigned = {
            ...whereWithAssigned,
            [db.Sequelize.Op.and]: [assignedExists],
          };
        }
      }

      console.log('Where clause:', whereWithAssigned);

      const orders = await db.Order.findAll({
        where: whereWithAssigned,
        order: [['createdAt', 'ASC']],
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id', 'name', 'deliveryTime'] }
        ]
      });

      console.log('Route orders found:', orders.length);

      // Tính toán thông tin tuyến
      const totalDistance = orders.length * 5; // Mock: 5km per order
      const estimatedDuration = orders.length * 30; // Mock: 30 minutes per order
      const totalCOD = orders.reduce((sum, order) => sum + (order.cod || 0), 0);

      return {
        routeInfo: {
          id: 1,
          name: `Tuyến ${officeId}`,
          startLocation: 'Bưu cục',
          totalStops: orders.length,
          completedStops: orders.filter(o => o.status === 'delivered').length,
          totalDistance,
          estimatedDuration,
          totalCOD,
          status: 'not_started'
        },
        deliveryStops: orders.map((order, index) => ({
          id: order.id,
          trackingNumber: order.trackingNumber,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          recipientAddress: order.recipientDetailAddress ? 
            order.recipientDetailAddress.replace(/,\s*\d+,\s*\d+$/, '') : '',
          codAmount: order.cod,
          priority: order.cod > 1000000 ? 'urgent' : 'normal',
          serviceType: order.serviceType?.name || 'Tiêu chuẩn',
          estimatedTime: this.calculateEstimatedTime(index),
          status: order.status === 'delivered' ? 'completed' : 
                  (order.status === 'in_transit' || order.status === 'picked_up') ? 'in_progress' : 'pending',
          coordinates: this.generateRealCoordinates(order.recipientWardCode, order.recipientCityCode, index),
          distance: 2.5 + (index * 0.5),
          travelTime: 15 + (index * 5)
        }))
      };
      
      console.log('Route result:', result);
      return result;
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
        page = 1, 
        limit = 10, 
        status, 
        dateFrom,
        dateTo 
      } = filters;
      
      const offset = (page - 1) * limit;
      const where = {
        toOfficeId: officeId,
        cod: { [db.Sequelize.Op.gt]: 0 }
      };

      if (status) where.status = status;
      if (dateFrom && dateTo) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [dateFrom, dateTo]
        };
      }
      
      console.log('COD where clause:', where);

      const { rows, count } = await db.Order.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['deliveredAt', 'DESC']],
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
          { model: db.Office, as: 'fromOffice', attributes: ['id', 'name'] },
          { model: db.Office, as: 'toOffice', attributes: ['id', 'name'] }
        ]
      });

      console.log('COD query result - count:', count);
      console.log('COD query result - rows length:', rows.length);

      // Tính tổng kết
      const summary = {
        totalCollected: rows.reduce((sum, order) => sum + (order.cod || 0), 0),
        totalSubmitted: rows.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.cod || 0), 0),
        totalPending: rows.filter(o => o.status === 'in_transit').reduce((sum, order) => sum + (order.cod || 0), 0),
        transactionCount: count
      };

      const result = {
        transactions: rows,
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

  generateMockCoordinates(index) {
    // Mock coordinates around Ho Chi Minh City
    const baseLat = 10.7769;
    const baseLng = 106.7009;
    return {
      lat: baseLat + (index * 0.01),
      lng: baseLng + (index * 0.01)
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
          status: 'pending',
          description: 'Đơn hàng được tạo',
          timestamp: new Date()
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
  }
};

export default orderService;
