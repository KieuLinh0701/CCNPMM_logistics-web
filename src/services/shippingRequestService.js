import db from '../models';
import { translateOrderStatus } from '../utils/orderUtils';
import { translateShippingRequestStatus, translateShippingRequestType } from '../utils/shippingRequestUtils';
import { Op } from "sequelize";

async function getManagersByOffice(officeId) {
  if (!officeId) return [];
  return await db.User.findAll({
    include: [{
      model: db.Employee,
      as: 'employee',
      where: { officeId, status: 'Active' }
    }],
    where: { role: 'manager' }
  });
}

const shippingRequestService = {

  // Get Shift Enum
  async getRequestTypes(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      const typesEnum = db.ShippingRequest.rawAttributes.requestType.values;

      return {
        success: true,
        message: 'Lấy danh sách loại yêu cầu thành công',
        requestTypes: typesEnum,
      };
    } catch (error) {
      console.error('Get Types Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Status Enum
  async getRequestStatuses(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum shift từ model Employee
      const statusesEnum = db.ShippingRequest.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh trạng thái yêu cầu thành công',
        statuses: statusesEnum,
      };
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Requests By User 
  async listUserRequests(userId, page, limit, filters) {
    try {
      const { Op } = db.Sequelize;

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Lọc dữ liệu
      const { searchText, requestType, status, startDate, endDate, sort } = filters || {};

      let whereCondition = { userId };

      // Tìm kiếm theo trackingNumber của Order
      if (searchText) {
        whereCondition['$order.trackingNumber$'] = { [Op.like]: `%${searchText}%` };
      }

      // Lọc theo loại request
      if (requestType && requestType !== 'All') {
        whereCondition.requestType = requestType;
      }

      // Lọc theo status
      if (status && status !== 'All') {
        whereCondition.status = status;
      }

      // Lọc theo ngày tạo và ngày phản hồi
      if (startDate && endDate) {
        whereCondition[Op.or] = [
          { createdAt: { [Op.between]: [startDate, endDate] } },
          { responseAt: { [Op.between]: [startDate, endDate] } }
        ];
      }

      // Sắp xếp
      let order = [['createdAt', 'DESC']];
      if (sort === 'newest') {
        order = [['createdAt', 'DESC']];
      } else if (sort === 'oldest') {
        order = [['createdAt', 'ASC']];
      }

      // Query ShippingRequests với include Order và Office
      const requestsResult = await db.ShippingRequest.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: db.Order,
            as: 'order',
            attributes: ['id', 'trackingNumber']
          },
        ],
        order,
        limit,
        offset: (page - 1) * limit,
      });

      return {
        success: true,
        message: 'Lấy danh sách yêu cầu thành công',
        requests: requestsResult.rows,
        total: requestsResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error('Get Requests By User error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  async createRequest(data) {
    const t = await db.sequelize.transaction();
    try {
      const {
        userId,
        trackingNumber,
        requestContent,
        requestType,
        contactName,
        contactPhoneNumber,
        contactEmail,
        contactCityCode,
        contactWardCode,
        contactDetailAddress
      } = data;

      // ================== 1. Kiểm tra user ==================
      let user = null;
      if (userId) {
        user = await db.User.findOne({ where: { id: userId } });
        if (!user) {
          return { success: false, message: 'Người dùng không tồn tại' };
        }
      }

      // ================== 2. Kiểm tra loại request hợp lệ ==================
      const validRequestTypes = ['Complaint', 'DeliveryReminder', 'ChangeOrderInfo', 'Inquiry', 'PickupReminder'];
      if (!requestType || !validRequestTypes.includes(requestType)) {
        return { success: false, message: "Loại yêu cầu không hợp lệ" };
      }

      // ================== 3. Kiểm tra quyền tạo request guest/user ==================
      const guestAllowedTypes = ['Inquiry', 'Complaint'];
      if (!userId) {
        if (!guestAllowedTypes.includes(requestType)) {
          return {
            success: false,
            message: `Khách hàng không phải user chỉ có thể tạo yêu cầu loại: ${guestAllowedTypes.join(', ')}`
          };
        }
        const trackingRequiredTypes = ['ChangeOrderInfo', 'DeliveryReminder', 'PickupReminder'];
        if (trackingRequiredTypes.includes(requestType) && (!trackingNumber || trackingNumber.trim() === '')) {
          return { success: false, message: "Loại yêu cầu này bắt buộc phải có mã đơn hàng" };
        }
      }

      // ================== 4. Kiểm tra nội dung ==================
      if (requestType !== 'DeliveryReminder' && requestType !== 'PickupReminder') {
        if (!requestContent || requestContent.trim().length === 0) {
          return { success: false, message: "Nội dung yêu cầu không được để trống" };
        }
      }
      if (requestContent && requestContent.length > 1000) {
        return { success: false, message: "Nội dung yêu cầu không được vượt quá 1000 ký tự" };
      }

      // ================== 5. Xử lý order nếu trackingNumber có ==================
      let order = null;
      let orderId = null;
      let officeId = null;
      const canTrackingNumberBeEmpty = ['Inquiry', 'Complaint'].includes(requestType);

      if (trackingNumber && trackingNumber.trim() !== '') {
        order = await db.Order.findOne({
          where: { trackingNumber: trackingNumber.trim(), userId: userId || undefined }
        });

        if (!order) {
          return { success: false, message: "Đơn hàng không tồn tại hoặc không thuộc về bạn" };
        }

        orderId = order.id;

        // Kiểm tra trạng thái hợp lệ theo loại request
        const allowedStatusPerRequestType = {
          ChangeOrderInfo: ['confirmed', 'in_transit', 'picked_up'],
          DeliveryReminder: ['picked_up', 'in_transit'],
          PickupReminder: ['pending', 'confirmed'],
          Complaint: ['picked_up', 'returned', 'in_transit', 'delivered', 'returning', 'delivering'],
          Inquiry: [],
        };

        const allowedStatuses = allowedStatusPerRequestType[requestType];
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(order.status)) {
          return {
            success: false,
            message: `Loại yêu cầu ${translateShippingRequestType(requestType)} không phù hợp khi đơn hàng đang ở trạng thái ${translateOrderStatus(order.status)}`
          };
        }

        // Check trùng lặp request
        const existingRequest = await db.ShippingRequest.findOne({
          where: { orderId, requestType, status: ['Pending', 'Processing'] }
        });

        if (existingRequest) {
          return { success: false, message: 'Đã có yêu cầu tương tự cho đơn hàng này đang được xử lý' };
        }

        // Logic gán office
        const orderWithOffice = await db.Order.findOne({
          where: { id: orderId },
          include: [
            { model: db.Office, as: 'fromOffice', attributes: ['id'] },
            { model: db.Office, as: 'toOffice', attributes: ['id'] }
          ]
        });

        if (orderWithOffice) {
          const orderStatus = order.status;
          switch (requestType) {
            case 'ChangeOrderInfo':
              if (['confirmed', 'picked_up'].includes(orderStatus)) {
                officeId = orderWithOffice.fromOffice?.id;
              } else if (orderStatus === 'in_transit') {
                officeId = orderWithOffice.toOffice?.id;
              }
              break;
            case 'DeliveryReminder':
              if (['picked_up'].includes(orderStatus)) {
                officeId = orderWithOffice.fromOffice?.id;
              } else if (orderStatus === 'in_transit') {
                officeId = orderWithOffice.toOffice?.id;
              }
              break;
            case 'Complaint':
              if (['picked_up', 'returned'].includes(orderStatus)) {
                officeId = orderWithOffice.fromOffice?.id;
              } else if (['in_transit', 'delivered', 'returning', 'delivering'].includes(orderStatus)) {
                officeId = orderWithOffice.toOffice?.id;
              }
              break;
            case 'PickupReminder':
              if (['pending', 'confirmed'].includes(orderStatus)) {
                officeId = orderWithOffice.fromOffice?.id;
              }
              break;
          }
        }
      } else if (!canTrackingNumberBeEmpty) {
        return { success: false, message: "Mã đơn hàng là bắt buộc cho loại yêu cầu này" };
      }

      // ================== 6. Tạo request ==================
      const newRequest = await db.ShippingRequest.create({
        orderId,
        officeId,
        requestType,
        requestContent: requestContent?.trim() || null,
        status: 'Pending',
        userId: userId || null,
        contactName: userId ? null : contactName,
        contactPhoneNumber: userId ? null : contactPhoneNumber,
        contactEmail: userId ? null : contactEmail,
        contactCityCode: userId ? null : contactCityCode,
        contactWardCode: userId ? null : contactWardCode,
        contactDetailAddress: userId ? null : contactDetailAddress
      }, { transaction: t });

      await t.commit();

      // ================== 7. Gửi notification ==================
      if (officeId) {
        const managers = await getManagersByOffice(officeId);
        const notifications = managers.map(u => ({
          userId: u.id,
          title: `Yêu cầu ${translateShippingRequestType(newRequest.requestType)} đã được gửi`,
          message: `Có yêu cầu mới cần xử lý.`,
          type: 'ShippingRequest',
          relatedId: newRequest.id,
          relatedType: 'ShippingRequest'
        }));
        if (notifications.length > 0) {
          await db.Notification.bulkCreate(notifications);
        }
      }

      return { success: true, message: "Tạo yêu cầu thành công", request: newRequest };
    } catch (error) {
      await t.rollback();
      console.error("Add Shipping Request error:", error);
      return { success: false, message: "Lỗi server khi tạo yêu cầu" };
    }
  },

  async updateRequest(userId, requestId, requestContent) {
    try {
      const result = await db.sequelize.transaction(async (t) => {
        const user = await db.User.findOne({ where: { id: userId }, transaction: t });
        if (!user) throw new Error('Người dùng không tồn tại');

        const shippingRequest = await db.ShippingRequest.findOne({
          where: { id: requestId },
          include: [{
            model: db.Order,
            as: 'order',
            attributes: ['id', 'trackingNumber', 'status', 'userId'],
            required: true
          }],
          transaction: t
        });

        if (!shippingRequest || shippingRequest.order.userId !== userId) throw new Error('Yêu cầu không tồn tại hoặc bạn không có quyền sửa');

        if (shippingRequest.status !== 'Pending') throw new Error('Chỉ có thể cập nhật yêu cầu khi trạng thái là đang chờ xử lý');

        // Kiểm tra requestContent, validation
        if (requestContent !== undefined && requestContent !== null) {
          if (!['DeliveryReminder', 'PickupReminder'].includes(shippingRequest.requestType)) {
            if (!requestContent.trim()) throw new Error("Nội dung yêu cầu không được để trống");
          }
          if (requestContent.length > 1000) throw new Error("Nội dung yêu cầu không được vượt quá 1000 ký tự");
          if (requestContent.trim() === shippingRequest.requestContent) throw new Error("Không có thay đổi nào để cập nhật");
        }

        const updateData = {};
        if (requestContent !== undefined && requestContent !== null) updateData.requestContent = requestContent.trim();
        if (Object.keys(updateData).length === 0) throw new Error("Không có dữ liệu nào để cập nhật");

        await shippingRequest.update(updateData, { transaction: t });

        return shippingRequest;
      });

      // gửi notification ngoài transaction
      if (result.officeId) {
        const users = await getManagersByOffice(result.officeId);

        const notifications = users.map(u => ({
          userId: u.id,
          title: `Yêu cầu ${translateShippingRequestType(result.requestType)} đã được cập nhật`,
          message: `Một yêu cầu chưa được xử lý đã được người dùng cập nhật nội dung.`,
          type: 'ShippingRequest',
          relatedId: result.id,
          relatedType: 'ShippingRequest'
        }));

        if (notifications.length > 0) await db.Notification.bulkCreate(notifications);
      }

      const updatedRequest = await db.ShippingRequest.findOne({
        where: { id: requestId },
        include: [{ model: db.Order, as: 'order', attributes: ['trackingNumber'] }]
      });

      return {
        success: true,
        message: "Cập nhật nội dung yêu cầu thành công",
        request: updatedRequest
      };

    } catch (error) {
      console.error("Update Shipping Request error:", error);
      return { success: false, message: error.message || "Lỗi server khi cập nhật yêu cầu" };
    }
  },

  async cancelRequest(userId, requestId) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm ShippingRequest kèm Order để kiểm tra ownership
      const shippingRequest = await db.ShippingRequest.findOne({
        where: { id: requestId },
        include: [
          {
            model: db.Order,
            as: 'order',
            where: { userId }
          },
          {
            model: db.Office,
            as: 'office',
            attributes: ['id']
          }
        ],
        transaction: t
      });

      if (!shippingRequest) {
        return {
          success: false,
          message: "Yêu cầu không tồn tại hoặc bạn không có quyền hủy"
        };
      }

      // 3. Kiểm tra trạng thái - CHỈ cho hủy khi Pending
      if (shippingRequest.status !== "Pending") {
        return {
          success: false,
          message: `Chỉ có thể hủy yêu cầu ở trạng thái ${translateShippingRequestStatus(shippingRequest.status)}`
        };
      }

      // 4. Cập nhật trạng thái -> Cancelled
      await shippingRequest.update({
        status: "Cancelled",
      }, { transaction: t });

      await t.commit();

      if (shippingRequest.officeId) {
        const users = await getManagersByOffice(shippingRequest.officeId);

        const notifications = users.map(u => ({
          userId: u.id,
          title: `Yêu cầu ${translateShippingRequestType(shippingRequest.requestType)} đã bị hủy`,
          message: `Một yêu cầu chưa xử lý đã bị hủy.`,
          type: 'ShippingRequest',
          relatedId: shippingRequest.id,
          relatedType: 'ShippingRequest'
        }));

        if (notifications.length > 0) {
          await db.Notification.bulkCreate(notifications);
        }
      }

      return {
        success: true,
        message: "Hủy yêu cầu thành công",
        request: shippingRequest
      };

    } catch (error) {
      if (!t.finished) {
        await t.rollback();
      }
      console.error("Cancel Shipping Request error:", error);
      return {
        success: false,
        message: error.message || "Lỗi server khi hủy yêu cầu",
      };
    }
  },

  // ===================== Manager ==============================

  // Get Requests By Office - cho manager
  async listOfficeRequests(userId, officeId, page, limit, filters) {
    try {
      const { Op } = db.Sequelize;

      // Kiểm tra user tồn tại và có phải manager không
      const user = await db.User.findOne({
        where: { id: userId },
        attributes: ['id', 'role']
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Chỉ cho phép manager
      if (user.role !== 'manager') {
        return { success: false, message: 'Chỉ manager mới có quyền truy cập' };
      }

      // Kiểm tra office có tồn tại không
      const office = await db.Office.findOne({
        where: { id: officeId },
        attributes: ['id', 'name']
      });

      if (!office) {
        return { success: false, message: 'Văn phòng không tồn tại' };
      }

      // Kiểm tra manager có phải Active Employee tại office này không
      const employee = await db.Employee.findOne({
        where: {
          userId: userId,
          officeId: officeId,
          status: 'Active'
        },
        include: [{
          model: db.Office,
          as: 'office',
          attributes: ['id', 'name']
        }]
      });

      if (!employee) {
        return { success: false, message: 'Bạn không thuộc văn phòng này hoặc không có quyền truy cập' };
      }

      let whereCondition = {
        officeId: officeId,
        status: {
          [Op.not]: 'Cancelled'
        }
      };

      // Lọc dữ liệu 
      const { searchText, requestType, status, startDate, endDate, sort } = filters || {};

      if (searchText) {
        const words = searchText.trim().split(/\s+/);

        whereCondition[Op.or] = [
          { '$order.trackingNumber$': { [Op.like]: `%${searchText}%` } },
          { '$user.phoneNumber$': { [Op.like]: `%${searchText}%` } },
          { '$user.email$': { [Op.like]: `%${searchText}%` } },
          { contactName: { [Op.like]: `%${searchText}%` } },
          { contactPhoneNumber: { [Op.like]: `%${searchText}%` } },
          { contactEmail: { [Op.like]: `%${searchText}%` } },
          {
            // Tìm tất cả từ trong firstName hoặc lastName
            [Op.and]: words.map(word => ({
              [Op.or]: [
                { '$user.firstName$': { [Op.like]: `%${word}%` } },
                { '$user.lastName$': { [Op.like]: `%${word}%` } },
              ]
            }))
          }
        ];
      }

      // Lọc theo loại request
      if (requestType && requestType !== 'All') {
        whereCondition.requestType = requestType;
      }

      // Lọc theo status
      if (status && status !== 'All') {
        whereCondition.status = status;
      }

      // Lọc theo ngày tạo và ngày phản hồi
      if (startDate && endDate) {
        whereCondition[Op.or] = [
          { createdAt: { [Op.between]: [startDate, endDate] } },
          { responseAt: { [Op.between]: [startDate, endDate] } }
        ];
      }

      // Sắp xếp
      let order = [['createdAt', 'DESC']];
      if (sort === 'newest') {
        order = [['createdAt', 'DESC']];
      } else if (sort === 'oldest') {
        order = [['createdAt', 'ASC']];
      }

      // Query ShippingRequests với include Order 
      const requestsResult = await db.ShippingRequest.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: db.Order,
            as: 'order',
            attributes: ['id', 'trackingNumber']
          },
          {
            model: db.User,
            as: 'user',
          },
        ],
        order,
        limit,
        offset: (page - 1) * limit,
      });

      return {
        success: true,
        message: `Lấy danh sách yêu cầu thành công`,
        requests: requestsResult.rows,
        total: requestsResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error('Get Requests By Office error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  async updateRequestByManager(managerId, requestId, response, status) {
    const t = await db.sequelize.transaction();
    try {
      // Kiểm tra trạng thái đầu vào
      if (!status) {
        return { success: false, message: "Trạng thái là bắt buộc" };
      }

      // Kiểm tra Manager có hợp lệ không
      const manager = await db.Employee.findOne({
        where: { userId: managerId, status: "Active" },
        include: [{ model: db.Office, as: "office" }],
      });

      if (!manager) {
        return { success: false, message: "Chỉ quản lý đang hoạt động mới có thể cập nhật yêu cầu" };
      }

      // Tìm yêu cầu cần cập nhật
      const request = await db.ShippingRequest.findOne({
        where: {
          id: requestId,
          officeId: manager.officeId,
        },
      });

      if (!request) {
        return { success: false, message: "Không tìm thấy yêu cầu hoặc không thuộc bưu cục của bạn" };
      }

      // Kiểm tra logic chuyển trạng thái hợp lệ
      const validTransitions = {
        Pending: ["Processing", "Resolved", "Rejected"],
        Processing: ["Resolved"],
        Resolved: [],
        Rejected: [],
        Cancelled: [],
      };

      if (!validTransitions[request.status].includes(status)) {
        return {
          success: false,
          message: `Không thể chuyển trạng thái từ ${request.status} sang ${status}`,
        };
      }

      // Cập nhật nội dung
      request.status = status;
      if (response) request.response = response;
      request.handlerId = manager.id;
      request.responseAt = new Date();

      await request.save({ transaction: t });

      // Gửi thông báo tới người dùng tạo yêu cầu
      if (request.userId) {
        const notification = await db.Notification.create(
          {
            userId: request.userId,
            title: `Cập nhật yêu cầu ${translateShippingRequestType(request.requestType)}`,
            message: `Yêu cầu của bạn hiện đã được cập nhật sang trạng thái "${translateShippingRequestStatus(status)}".`,
            type: "ShippingRequest",
            relatedId: request.id,
            relatedType: "ShippingRequest",
          },
          { transaction: t }
        );

        // websocket server
        // io.to(`user_${request.userId}`).emit('notification', notification);
      }

      // Nếu muốn thông báo cho các manager khác cùng office
      const otherManagers = await db.User.findAll({
        include: [{
          model: db.Employee,
          as: 'employee',
          where: { officeId: manager.officeId, status: 'Active' }
        }],
        where: { role: 'manager', id: { [db.Sequelize.Op.ne]: managerId } }
      });

      const notifications = otherManagers.map(u => ({
        userId: u.id,
        title: `Yêu cầu ${translateShippingRequestType(request.requestType)} đã được xử lý`,
        message: `Một manager khác đã cập nhật trạng thái yêu cầu tại bưu cục của bạn.`,
        type: 'ShippingRequest',
        relatedId: request.id,
        relatedType: 'ShippingRequest'
      }));

      if (notifications.length > 0) {
        await db.Notification.bulkCreate(notifications);
      }


      await t.commit();

      return {
        success: true,
        message: "Cập nhật yêu cầu thành công",
        request,
      };
    } catch (error) {
      await t.rollback();
      console.error("Update Shipping Request error:", error);
      return { success: false, message: "Lỗi server khi cập nhật yêu cầu" };
    }
  },

};

export default shippingRequestService;