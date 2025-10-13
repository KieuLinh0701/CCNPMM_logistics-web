import db from '../models';

const requestService = {

  // Get Shift Enum
  async getTypesEnum(userId) {
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
  async getRequestsByUser(userId, page, limit, filters) {
    try {
      const { Op } = db.Sequelize;

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Lấy tất cả orders của user
      const userOrders = await db.Order.findAll({
        where: { userId },
        attributes: ['id']
      });

      const orderIds = userOrders.map(order => order.id);

      if (orderIds.length === 0) {
        return {
          success: true,
          message: 'Người dùng chưa có đơn hàng nào',
          requests: [],
          total: 0,
          page,
          limit,
        };
      }

      // Điều kiện where cho ShippingRequest
      let whereCondition = {
        orderId: { [Op.in]: orderIds }
      };

      // Lọc dữ liệu
      const { searchText, requestType, status, startDate, endDate, sort } = filters || {};

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

      // Lọc theo ngày tạo
      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
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

  async addRequest(userId, trackingNumber, requestContent, requestType) {
    const t = await db.sequelize.transaction();
    try {
      // Kiểm tra user tồn tại
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Kiểm tra loại yêu cầu hợp lệ
      const validRequestTypes = ['Complaint', 'DeliveryReminder', 'ChangeOrderInfo', 'Inquiry'];
      if (!requestType || !validRequestTypes.includes(requestType)) {
        return { success: false, message: "Loại yêu cầu không hợp lệ" };
      }

      // Kiểm tra nội dung yêu cầu (cho phép trống với DeliveryReminder)
      if (requestType !== 'DeliveryReminder') {
        if (!requestContent || requestContent.trim().length === 0) {
          return { success: false, message: "Nội dung yêu cầu không được để trống" };
        }
      }

      if (requestContent && requestContent.length > 1000) {
        return { success: false, message: "Nội dung yêu cầu không được vượt quá 1000 ký tự" };
      }

      let order = null;
      let orderId = null;
      let officeId = null;

      // Xác định các loại yêu cầu có thể để trống trackingNumber
      const canTrackingNumberBeEmpty = ['Inquiry', 'Complaint'].includes(requestType);

      // Kiểm tra trackingNumber theo loại yêu cầu
      if (!trackingNumber || trackingNumber.trim() === '') {
        // Nếu không có trackingNumber, chỉ cho phép loại Inquiry và Complaint
        if (!canTrackingNumberBeEmpty) {
          return {
            success: false,
            message: "Mã đơn hàng là bắt buộc cho loại yêu cầu này"
          };
        }
      } else {
        // Nếu có trackingNumber thì kiểm tra order
        order = await db.Order.findOne({
          where: {
            trackingNumber: trackingNumber.trim(),
            userId: userId
          }
        });

        if (!order) {
          return { success: false, message: "Đơn hàng không tồn tại hoặc không thuộc về bạn" };
        }

        orderId = order.id;

        // Kiểm tra request trùng lặp
        if (orderId) {
          const existingRequest = await db.ShippingRequest.findOne({
            where: {
              orderId: orderId,
              requestType: requestType,
              status: ['Pending', 'Processing']
            }
          });

          if (existingRequest) {
            return {
              success: false,
              message: 'Đã có yêu cầu tương tự cho đơn hàng này đang được xử lý. Vui lòng đợi hoàn tất trước khi tạo yêu cầu mới'
            };
          }
        }

        // Kiểm tra trạng thái order theo từng loại yêu cầu
        const orderStatus = order.status;

        // DeliveryReminder: không được tạo nếu order ở trạng thái draft, cancelled, delivered
        if (requestType === 'DeliveryReminder') {
          const invalidStatuses = ['draft', 'cancelled', 'delivered', 'returned'];
          if (invalidStatuses.includes(orderStatus)) {
            return {
              success: false,
              message: "Không thể tạo yêu cầu hối giao hàng cho đơn hàng ở trạng thái này"
            };
          }
        }

        // Complaint: không được tạo nếu order ở trạng thái draft, pending, confirmed, cancelled
        if (requestType === 'Complaint') {
          const invalidStatuses = ['draft', 'pending', 'confirmed', 'cancelled'];
          if (invalidStatuses.includes(orderStatus)) {
            return {
              success: false,
              message: "Không thể tạo yêu cầu khiếu nại cho đơn hàng ở trạng thái này"
            };
          }
        }

        // ChangeOrderInfo: không được tạo nếu order ở trạng thái cancelled, delivered
        if (requestType === 'ChangeOrderInfo') {
          const invalidStatuses = ['cancelled', 'delivered', 'returned'];
          if (invalidStatuses.includes(orderStatus)) {
            return {
              success: false,
              message: "Không thể thay đổi thông tin đơn hàng ở trạng thái này"
            };
          }
        }

        // GÁN OFFICE THEO LOGIC - THÊM PHẦN NÀY
        if (orderId && requestType !== 'Inquiry') {
          // Lấy thông tin order với office
          const orderWithOffice = await db.Order.findOne({
            where: { id: orderId },
            include: [
              {
                model: db.Office,
                as: 'fromOffice',
                attributes: ['id']
              },
              {
                model: db.Office,
                as: 'toOffice',
                attributes: ['id']
              }
            ]
          });

          if (orderWithOffice) {
            // Logic gán office theo loại request và trạng thái order
            switch (requestType) {
              case 'ChangeOrderInfo':
                if (['draft', 'pending', 'confirmed', 'picked_up'].includes(orderStatus)) {
                  officeId = orderWithOffice.fromOffice?.id;
                } else if (orderStatus === 'in_transit') {
                  officeId = orderWithOffice.toOffice?.id;
                }
                break;

              case 'DeliveryReminder':
                if (['pending', 'confirmed', 'picked_up'].includes(orderStatus)) {
                  officeId = orderWithOffice.fromOffice?.id;
                } else if (orderStatus === 'in_transit') {
                  officeId = orderWithOffice.toOffice?.id;
                }
                break;

              case 'Complaint':
                if (orderStatus === 'picked_up') {
                  officeId = orderWithOffice.fromOffice?.id;
                } else if (['in_transit', 'delivered', 'returned'].includes(orderStatus)) {
                  officeId = orderWithOffice.toOffice?.id;
                }
                break;

              default:
                // Inquiry không gán office
                break;
            }
          }
        }
      }

      // Tạo shipping request mới
      const newRequest = await db.ShippingRequest.create({
        orderId: orderId,
        officeId: officeId,
        requestType: requestType,
        requestContent: requestContent ? requestContent.trim() : null,
        status: 'Pending',
      }, { transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Tạo yêu cầu thành công",
        request: newRequest,
      };
    } catch (error) {
      await t.rollback();
      console.error("Add Shipping Request error:", error);
      return { success: false, message: "Lỗi server khi tạo yêu cầu" };
    }
  },

  async updateRequest(userId, requestId, requestContent) {
    const t = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      const shippingRequest = await db.ShippingRequest.findOne({
        where: { id: requestId },
        include: [{
          model: db.Order,
          as: 'order',
          attributes: ['id', 'trackingNumber', 'status', 'userId'],
          required: true
        }]
      });

      // Kiểm tra quyền sở hữu thông qua Order
      if (!shippingRequest || shippingRequest.order.userId !== userId) {
        return { success: false, message: 'Yêu cầu không tồn tại hoặc bạn không có quyền sửa' };
      }

      if (shippingRequest.status !== 'Pending') {
        return {
          success: false,
          message: 'Chỉ có thể cập nhật yêu cầu khi trạng thái là đang chờ xử lý'
        };
      }

      if (requestContent !== undefined && requestContent !== null) {
        if (shippingRequest.requestType !== 'DeliveryReminder') {
          if (!requestContent.trim() || requestContent.trim().length === 0) {
            return { success: false, message: "Nội dung yêu cầu không được để trống" };
          }
        }

        if (requestContent.length > 1000) {
          return { success: false, message: "Nội dung yêu cầu không được vượt quá 1000 ký tự" };
        }

        if (requestContent.trim() === shippingRequest.requestContent) {
          return { success: false, message: "Không có thay đổi nào để cập nhật" };
        }
      }

      const updateData = {};
      if (requestContent !== undefined && requestContent !== null) {
        updateData.requestContent = requestContent.trim();
      }

      if (Object.keys(updateData).length === 0) {
        return { success: false, message: "Không có dữ liệu nào để cập nhật" };
      }

      await shippingRequest.update(updateData, { transaction: t });
      await t.commit();

      const updatedRequest = await db.ShippingRequest.findOne({
        where: { id: requestId },
        include: [{
          model: db.Order,
          as: 'order',
          attributes: ['trackingNumber']
        }]
      });

      return {
        success: true,
        message: "Cập nhật nội dung yêu cầu thành công",
        request: updatedRequest
      };
    } catch (error) {
      await t.rollback();
      console.error("Update Shipping Request error:", error);
      return { success: false, message: "Lỗi server khi cập nhật yêu cầu" };
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
        include: [{
          model: db.Order,
          as: 'order',
          where: { userId }
        }],
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
          message: "Chỉ có thể hủy yêu cầu ở trạng thái 'Pending'"
        };
      }

      // 4. Cập nhật trạng thái -> Cancelled
      await shippingRequest.update({
        status: "Cancelled",
      }, { transaction: t });

      await t.commit();

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

  // Get Requests By Office - cho manager
  async getRequestsByOffice(userId, officeId, page, limit, filters) {
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
          status: 'Active' // Chỉ kiểm tra nhân viên đang active
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

      // Điều kiện where cho ShippingRequest - chỉ thay đổi phần này
      let whereCondition = {
        officeId: officeId, // Thay orderId bằng officeId
        status: {
          [Op.not]: 'Cancelled' // KHÔNG lấy các request đã hủy
        }
      };

      // Lọc dữ liệu - GIỮ NGUYÊN như getRequestsByUser
      const { searchText, requestType, status, startDate, endDate, sort } = filters || {};

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

      // Lọc theo ngày tạo
      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
      }

      // Sắp xếp - GIỮ NGUYÊN
      let order = [['createdAt', 'DESC']];
      if (sort === 'newest') {
        order = [['createdAt', 'DESC']];
      } else if (sort === 'oldest') {
        order = [['createdAt', 'ASC']];
      }

      // Query ShippingRequests với include Order - GIỮ NGUYÊN
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

};

export default requestService;