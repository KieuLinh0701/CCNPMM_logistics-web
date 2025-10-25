import db from "../models";
import vehicleService from "../services/vehicleService";

const driverController = {
  async getContext(req, res) {
    try {
      const userId = req.user.id;
      console.log('[driver.getContext] userId=', userId);
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Employee, as: "employee" }],
      });
      if (!user || !user.employee) {
        console.log('[driver.getContext] missing employee for userId', userId);
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin nhân viên" });
      }
      console.log('[driver.getContext] employee.officeId=', user.employee.officeId);
      const office = await db.Office.findByPk(user.employee.officeId);
      const vehiclesRes = await vehicleService.getVehiclesByOffice(userId, user.employee.officeId, 1, 50, { status: 'Available' });
      console.log('[driver.getContext] office found?', !!office, 'vehicles count=', (vehiclesRes.vehicles || []).length);
      return res.json({ success: true, data: { office, vehicles: vehiclesRes.vehicles || [] } });
    } catch (err) {
      console.error("driver.getContext error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Danh sách đơn Confirmed của văn phòng driver
  async getConfirmedOrders(req, res) {
    try {
      const userId = req.user.id;
      console.log('[driver.getConfirmedOrders] userId=', userId);
      const user = await db.User.findByPk(userId, { 
        include: [{ 
          model: db.Employee, 
          as: 'employee',
          include: [{ model: db.Office, as: 'office', attributes: ['id', 'name', 'address'] }]
        }]
      });
      if (!user || !user.employee) {
        console.log('[driver.getConfirmedOrders] missing employee for userId', userId);
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin nhân viên" });
      }
      const officeId = user.employee.officeId;
      console.log('[driver.getConfirmedOrders] query where:', { status: 'confirmed', fromOfficeId: officeId });
      const orders = await db.Order.findAll({
        where: { status: 'confirmed', fromOfficeId: officeId },
        order: [["createdAt", "ASC"]],
        include: [
          { model: db.Office, as: 'fromOffice', attributes: ['id','name'] },
          { model: db.Office, as: 'toOffice', attributes: ['id','name'] },
          { model: db.ServiceType, as: 'serviceType', attributes: ['id','name'] },
        ]
      });
      console.log('[driver.getConfirmedOrders] result count=', orders.length);
      return res.json({ success: true, data: orders });
    } catch (err) {
      console.error("driver.getConfirmedOrders error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Driver xác nhận nhận hàng: set orders -> picked_up, tạo Shipment(Pending) + ShipmentOrder
  async pickUp(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const userId = req.user.id;
      const { vehicleId, orderIds } = req.body;
      console.log('[driver.pickUp] userId=', userId, 'vehicleId=', vehicleId, 'orderIds=', orderIds);

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Thiếu danh sách đơn" });
      }

      const user = await db.User.findByPk(userId, { include: [{ model: db.Employee, as: 'employee' }], transaction: t });
      if (!user || !user.employee) {
        await t.rollback();
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin nhân viên" });
      }

      // Tạo shipment pending
      const shipment = await db.Shipment.create({ userId, vehicleId: vehicleId || null, status: 'Pending', startTime: new Date() }, { transaction: t });
      console.log('[driver.pickUp] created shipmentId=', shipment.id);

      // Cập nhật đơn và tạo shipmentOrder
      for (const oid of orderIds) {
        const order = await db.Order.findByPk(oid, { transaction: t });
        if (!order) {
          console.log('[driver.pickUp] skip - order not found:', oid);
          continue;
        }
        // Chỉ nhận đơn confirmed tại văn phòng của driver
        if (order.status !== 'confirmed') {
          console.log('[driver.pickUp] skip - status not confirmed:', { orderId: order.id, status: order.status });
          continue;
        }
        if (order.fromOfficeId !== user.employee.officeId) {
          console.log('[driver.pickUp] skip - office mismatch:', { orderId: order.id, orderFromOfficeId: order.fromOfficeId, driverOfficeId: user.employee.officeId });
          continue;
        }

        await db.Order.update({ status: 'picked_up' }, { where: { id: order.id }, transaction: t });
        await db.ShipmentOrder.create({ shipmentId: shipment.id, orderId: order.id }, { transaction: t });
        console.log('[driver.pickUp] linked order to shipment:', { orderId: order.id, shipmentId: shipment.id });

        // Ghi lịch sử
        await db.OrderHistory.create({
          orderId: order.id,
          fromOfficeId: order.fromOfficeId || user.employee.officeId,
          toOfficeId: order.toOfficeId || null,
          shipmentId: shipment.id,
          action: 'PickedUp',
          note: `Driver ${userId} đã nhận hàng để vận chuyển`,
          actionTime: new Date()
        }, { transaction: t });
      }

      await t.commit();
      console.log('[driver.pickUp] done shipmentId=', shipment.id);
      return res.json({ success: true, data: { shipmentId: shipment.id } });
    } catch (err) {
      await t.rollback();
      console.error("driver.pickUp error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Bắt đầu vận chuyển: Shipment -> InTransit, Orders -> in_transit
  async startShipment(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const userId = req.user.id;
      const { shipmentId } = req.body;
      console.log('[driver.startShipment] userId=', userId, 'shipmentId=', shipmentId);
      const shipment = await db.Shipment.findOne({ where: { id: shipmentId, userId }, transaction: t });
      if (!shipment) {
        await t.rollback();
        console.log('[driver.startShipment] shipment not found or not owned');
        return res.status(404).json({ success: false, message: 'Không tìm thấy shipment' });
      }
      await shipment.update({ status: 'InTransit' }, { transaction: t });

      const links = await db.ShipmentOrder.findAll({ where: { shipmentId: shipment.id }, include: [{ model: db.Order, as: 'order' }], transaction: t });
      const orderIds = links.map(l => l.orderId);
      console.log('[driver.startShipment] linked orders count=', orderIds.length);
      if (orderIds.length) {
        await db.Order.update({ status: 'in_transit' }, { where: { id: orderIds }, transaction: t });
        // Lịch sử
        for (const link of links) {
          const o = link.order;
          await db.OrderHistory.create({
            orderId: o.id,
            fromOfficeId: o.fromOfficeId || null,
            toOfficeId: o.toOfficeId || null,
            shipmentId: shipment.id,
            action: 'Shipping',
            note: 'Đơn hàng đang được vận chuyển giữa bưu cục',
            actionTime: new Date()
          }, { transaction: t });
        }
      }

      await t.commit();
      console.log('[driver.startShipment] done');
      return res.json({ success: true });
    } catch (err) {
      await t.rollback();
      console.error("driver.startShipment error", err);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Hoàn tất/huỷ vận chuyển tại bưu cục đích: Shipment -> Completed/Cancelled, ghi lịch sử
  async finishShipment(req, res) {
    const t = await db.sequelize.transaction();
    try {
      const userId = req.user.id;
      const { shipmentId, status } = req.body; // status: Completed | Cancelled
      console.log('[driver.finishShipment] userId=', userId, 'shipmentId=', shipmentId, 'status=', status);
      if (!['Completed','Cancelled'].includes(status)) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      }
      const shipment = await db.Shipment.findOne({ where: { id: shipmentId, userId }, transaction: t });
      if (!shipment) {
        await t.rollback();
        console.log('[driver.finishShipment] shipment not found or not owned');
        return res.status(404).json({ success: false, message: 'Không tìm thấy shipment' });
      }

      await shipment.update({ status, endTime: new Date() }, { transaction: t });

      const links = await db.ShipmentOrder.findAll({ where: { shipmentId: shipment.id }, include: [{ model: db.Order, as: 'order' }], transaction: t });
      console.log('[driver.finishShipment] linked orders count=', links.length);
      for (const link of links) {
        const orderId = link.orderId;
        const o = link.order;
        // Ghi lịch sử đến bưu cục đích / hoặc hủy
        await db.OrderHistory.create({
          orderId,
          fromOfficeId: o.fromOfficeId || null,
          toOfficeId: o.toOfficeId || null,
          shipmentId: shipment.id,
          action: status === 'Completed' ? 'Imported' : 'Returned',
          note: status === 'Completed' ? 'Đơn đã đến bưu cục đích' : 'Chuyến vận chuyển bị hủy',
          actionTime: new Date()
        }, { transaction: t });

        // Nếu hoàn tất chuyến, cập nhật trạng thái đơn hàng sang arrived_at_office
        if (status === 'Completed') {
          await db.Order.update({ status: 'arrived_at_office' }, { where: { id: orderId }, transaction: t });
        }
      }

      await t.commit();
      return res.json({ success: true });
    } catch (err) {
      await t.rollback();
      console.error("driver.finishShipment error", err);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Lấy danh sách shipments của driver
  async getShipments(req, res) {
    try {
      const userId = req.user.id;
      console.log('[driver.getShipments] userId=', userId);
      const shipments = await db.Shipment.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.Vehicle, as: 'vehicle', attributes: ['id', 'licensePlate', 'type'] },
          { 
            model: db.ShipmentOrder, 
            as: 'shipmentOrders',
            include: [
              { 
                model: db.Order, 
                as: 'order',
                attributes: ['id', 'trackingNumber'],
                include: [
                  { model: db.Office, as: 'toOffice', attributes: ['id', 'name'] }
                ]
              }
            ]
          }
        ]
      });

      const formattedShipments = shipments.map(shipment => ({
        id: shipment.id,
        status: shipment.status,
        startTime: shipment.startTime,
        endTime: shipment.endTime,
        vehicle: shipment.vehicle,
        orders: shipment.shipmentOrders?.map(so => ({
          id: so.order.id,
          trackingNumber: so.order.trackingNumber,
          toOffice: so.order.toOffice
        })) || [],
        orderCount: shipment.shipmentOrders?.length || 0
      }));

      console.log('[driver.getShipments] result count=', formattedShipments.length);
      return res.json({ success: true, data: formattedShipments });
    } catch (err) {
      console.error("driver.getShipments error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Lấy lộ trình vận chuyển
  async getRoute(req, res) {
    try {
      const userId = req.user.id;
      const { date } = req.query;
      console.log('[driver.getRoute] userId=', userId, 'date=', date);
      
      const user = await db.User.findByPk(userId, { include: [{ model: db.Employee, as: 'employee' }] });
      if (!user || !user.employee) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông tin nhân viên" });
      }

      // Tìm shipment đang hoạt động
      const activeShipment = await db.Shipment.findOne({
        where: { 
          userId, 
          status: { [db.Sequelize.Op.in]: ['Pending', 'InTransit'] }
        },
        include: [
          { 
            model: db.ShipmentOrder, 
            as: 'shipmentOrders',
            include: [
              { 
                model: db.Order, 
                as: 'order',
                include: [
                  { model: db.Office, as: 'fromOffice', attributes: ['id', 'name', 'address'] },
                  { model: db.Office, as: 'toOffice', attributes: ['id', 'name', 'address'] }
                ]
              }
            ]
          }
        ]
      });

      if (!activeShipment) {
        console.log('[driver.getRoute] no active shipment');
        return res.json({ success: true, data: null });
      }

      const orders = activeShipment.shipmentOrders?.map(so => so.order) || [];
      console.log('[driver.getRoute] activeShipmentId=', activeShipment.id, 'ordersCount=', orders.length);
      const uniqueOffices = [...new Set(orders.map(o => o.toOffice?.id).filter(Boolean))];
      
      // Nhóm orders theo bưu cục đích
      const officeGroups = {};
      orders.forEach(order => {
        const officeId = order.toOffice?.id;
        if (officeId) {
          if (!officeGroups[officeId]) {
            officeGroups[officeId] = {
              office: order.toOffice,
              orders: []
            };
          }
          officeGroups[officeId].orders.push(order);
        }
      });

      // Tạo delivery stops từ các bưu cục
      const deliveryStops = Object.values(officeGroups).map((group, index) => ({
        id: group.office.id,
        trackingNumber: `OFFICE-${group.office.id}`,
        officeName: group.office.name,
        officePhone: group.office.phone || 'N/A',
        officeAddress: group.office.address,
        orderCount: group.orders.length,
        priority: group.orders.some(order => order.priority === 'urgent') ? 'urgent' : 'normal',
        serviceType: 'Vận chuyển bưu cục',
        estimatedTime: '30 phút', // Mock data
        status: 'pending',
        coordinates: {
          lat: 10.7769 + (index * 0.01), // Mock coordinates
          lng: 106.7009 + (index * 0.01)
        },
        distance: 5 + (index * 2), // Mock distance
        travelTime: 15 + (index * 5), // Mock travel time
        toOffice: group.office
      }));

      // Tính toán thông tin tuyến
      const totalDistance = deliveryStops.reduce((sum, stop) => sum + stop.distance, 0);
      const totalDuration = deliveryStops.reduce((sum, stop) => sum + stop.travelTime, 0);
      const totalOrders = deliveryStops.reduce((sum, stop) => sum + stop.orderCount, 0);

      const routeInfo = {
        id: activeShipment.id,
        name: `Tuyến vận chuyển #${activeShipment.id}`,
        startLocation: user.employee?.office?.address || 'Văn phòng xuất phát',
        totalStops: deliveryStops.length,
        completedStops: 0,
        totalDistance: totalDistance,
        estimatedDuration: totalDuration,
        totalOrders: totalOrders,
        status: activeShipment.status === 'Pending' ? 'not_started' : 'in_progress',
        fromOffice: user.employee?.office || null,
        toOffices: uniqueOffices.map(officeId => {
          const office = orders.find(o => o.toOffice?.id === officeId)?.toOffice;
          return office;
        }).filter(Boolean)
      };

      return res.json({ 
        success: true, 
        data: {
          routeInfo,
          deliveryStops
        }
      });
    } catch (err) {
      console.error("driver.getRoute error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Bắt đầu tuyến vận chuyển
  async startRoute(req, res) {
    try {
      const userId = req.user.id;
      const { routeId } = req.body;

      // Cập nhật trạng thái shipment
      await db.Shipment.update(
        { status: 'InTransit' },
        { where: { id: routeId, userId } }
      );

      return res.json({
        success: true,
        message: 'Đã bắt đầu tuyến vận chuyển'
      });
    } catch (error) {
      console.error('Start route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Tạm dừng tuyến vận chuyển
  async pauseRoute(req, res) {
    try {
      const userId = req.user.id;
      const { routeId } = req.body;

      // Cập nhật trạng thái shipment
      await db.Shipment.update(
        { status: 'Paused' },
        { where: { id: routeId, userId } }
      );

      return res.json({
        success: true,
        message: 'Đã tạm dừng tuyến vận chuyển'
      });
    } catch (error) {
      console.error('Pause route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Tiếp tục tuyến vận chuyển
  async resumeRoute(req, res) {
    try {
      const userId = req.user.id;
      const { routeId } = req.body;

      // Cập nhật trạng thái shipment
      await db.Shipment.update(
        { status: 'InTransit' },
        { where: { id: routeId, userId } }
      );

      return res.json({
        success: true,
        message: 'Đã tiếp tục tuyến vận chuyển'
      });
    } catch (error) {
      console.error('Resume route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy lịch sử vận chuyển
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const { status, dateFrom, dateTo } = req.query;
      console.log('[driver.getHistory] userId=', userId, 'filters=', { status, dateFrom, dateTo });
      
      let whereCondition = { userId };
      
      if (status) {
        whereCondition.status = status;
      }
      
      if (dateFrom && dateTo) {
        whereCondition.createdAt = {
          [db.Sequelize.Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      const shipments = await db.Shipment.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        include: [
          { model: db.Vehicle, as: 'vehicle', attributes: ['id', 'licensePlate', 'type'] },
          { 
            model: db.ShipmentOrder, 
            as: 'shipmentOrders',
            include: [
              { 
                model: db.Order, 
                as: 'order',
                attributes: ['id', 'trackingNumber'],
                include: [
                  { model: db.Office, as: 'toOffice', attributes: ['id', 'name'] }
                ]
              }
            ]
          }
        ]
      });

      const formattedHistory = shipments.map(shipment => {
        const startTime = new Date(shipment.startTime);
        const endTime = shipment.endTime ? new Date(shipment.endTime) : null;
        const duration = endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : 0;

        return {
          id: shipment.id,
          status: shipment.status,
          startTime: shipment.startTime,
          endTime: shipment.endTime,
          vehicle: shipment.vehicle,
          orders: shipment.shipmentOrders?.map(so => ({
            id: so.order.id,
            trackingNumber: so.order.trackingNumber,
            toOffice: so.order.toOffice
          })) || [],
          orderCount: shipment.shipmentOrders?.length || 0,
          duration: Math.round(duration * 10) / 10 // Làm tròn 1 chữ số thập phân
        };
      });

      console.log('[driver.getHistory] result count=', formattedHistory.length);
      return res.json({ success: true, data: formattedHistory });
    } catch (err) {
      console.error("driver.getHistory error", err);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
};

export default driverController;


