import orderService from '../services/orderService.js';
import employeeService from '../services/employeeService.js';
import notificationService from '../services/notificationService.js';
import { emitToUser } from '../socket.js';
import { Op } from 'sequelize';
import db from '../models/index.js';

const shipperController = {
  // Lấy dashboard data cho shipper
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      console.log('=== SHIPPER DASHBOARD DEBUG ===');
      console.log('User ID:', userId);
      console.log('User object:', req.user);
      
      // Lấy thông tin employee của shipper
      console.log('Getting employee by user ID:', userId);
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', employee);
      
      if (!employee) {
        console.log('❌ No employee found for user ID:', userId);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const officeId = employee.officeId;
      console.log('Office ID:', officeId);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      console.log('Date range:', { today, tomorrow });

      // Thống kê đơn hàng
      console.log('Getting shipper stats...');
      const stats = await orderService.getShipperStats(officeId, today, tomorrow);
      console.log('Stats result:', stats);
      
      // Đơn hàng hôm nay
      console.log('Getting today orders...');
      const todayOrders = await orderService.getShipperOrders({
        officeId,
        dateFrom: today,
        dateTo: tomorrow,
        limit: 10
      });
      console.log('Today orders result:', todayOrders);

      // Thông báo (có thể mở rộng sau)
      const notifications = [];

      return res.json({
        success: true,
        data: {
          stats,
          todayOrders,
          notifications
        }
      });
    } catch (error) {
      console.error('Shipper dashboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy danh sách đơn hàng của shipper
  async getOrders(req, res) {
    try {
      console.log('=== SHIPPER GET ORDERS START ===');
      console.log('User ID:', req.user.id);
      console.log('Query params:', req.query);
      
      const userId = req.user.id;
      const { page = 1, limit = 10, status, search, route } = req.query;
      
      // Lấy thông tin employee
      console.log('Getting employee by userId:', userId);
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', employee);
      
      if (!employee) {
        console.log('Employee not found for userId:', userId);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const filters = {
        officeId: employee.officeId,
        shipperUserId: userId,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search,
        route
      };

      console.log('Filters for orderService:', filters);
      const result = await orderService.getShipperOrders(filters);
      console.log('OrderService result:', result);

      return res.json({
        success: true,
        data: {
          orders: result.orders,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('=== SHIPPER GET ORDERS ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Danh sách đơn chưa gán cho shipper (theo bưu cục của shipper)
  async getUnassignedOrders(req, res) {
    try {
      console.log('=== SHIPPER GET UNASSIGNED START ===');
      const userId = req.user.id;
      const { page = 1, limit = 10, status, search, dateFrom, dateTo } = req.query;

      const employee = await employeeService.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhân viên' });
      }

      const result = await orderService.listUnassignedOrders({
        officeId: employee.officeId,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        search,
        dateFrom,
        dateTo,
      });

      return res.json({ success: true, data: { orders: result.orders, pagination: result.pagination } });
    } catch (error) {
      console.error('=== SHIPPER GET UNASSIGNED ERROR ===', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Shipper nhận đơn
  async claimOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await orderService.claimOrder(userId, id);
      if (!result.success) return res.status(400).json(result);

      // Lấy thông tin employee để có officeId
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found for notification:', employee);
      
      if (employee) {
        try {
          console.log('Creating notification for user:', userId, 'office:', employee.officeId);
          
          // Tạo orderData từ orderId vì claimOrder không trả về data
          const orderData = { id: parseInt(id) };
          console.log('Order data:', orderData);
          
          // Tạo thông báo trong database TRƯỚC
          const notificationResult = await notificationService.notifyOrderAssigned(userId, orderData, employee.officeId);
          console.log('Notification result:', notificationResult);
          
          // Emit realtime notification với dữ liệu từ database
          if (notificationResult.success) {
            console.log('Emitting WebSocket notification...');
            console.log('Notification data to emit:', {
              id: notificationResult.data.id,
              type: notificationResult.data.type,
              title: notificationResult.data.title,
              message: notificationResult.data.message,
              isRead: notificationResult.data.isRead,
              createdAt: notificationResult.data.createdAt
            });
            
            emitToUser(userId, 'notification', {
              id: notificationResult.data.id,
              type: notificationResult.data.type,
              title: notificationResult.data.title,
              message: notificationResult.data.message,
              isRead: notificationResult.data.isRead,
              createdAt: notificationResult.data.createdAt
            });
            console.log('WebSocket notification sent to user:', userId);
          } else {
            console.log('Failed to create notification:', notificationResult.message);
          }
        } catch (error) {
          console.error('Error in notification process:', error);
        }
      } else {
        console.log('No employee found for user:', userId);
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Shipper claim order error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Shipper bỏ nhận đơn
  async unclaimOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await orderService.unclaimOrder(userId, id);
      if (!result.success) return res.status(400).json(result);
      return res.json({ success: true });
    } catch (error) {
      console.error('Shipper unclaim order error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log('=== SHIPPER GET ORDER DETAIL START ===', { id, userId });

      // Lấy thông tin employee
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee resolved for user:', employee && { id: employee.id, officeId: employee.officeId });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin nhân viên' });
      }

      // Gọi service và bóc tách đúng cấu trúc
      const result = await orderService.getOrderById(id);
      console.log('Order service result:', result && { success: result.success, hasData: !!result.data });
      if (!result || result.success === false) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
      }
      const order = result.data;

      // Kiểm tra quyền truy cập (đơn hàng phải thuộc về office của shipper)
      console.log('Access check:', { orderToOfficeId: order.toOfficeId, shipperOfficeId: employee.officeId });
      if (order.toOfficeId !== employee.officeId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập đơn hàng này' });
      }

      return res.json({ success: true, data: order });
    } catch (error) {
      console.error('Get order detail error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Cập nhật trạng thái giao hàng
  async updateDeliveryStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, proofImages, actualRecipient, actualRecipientPhone, codCollected, totalAmountCollected, shipperId } = req.body;
      const userId = req.user.id;

      // Lấy thông tin employee
      const employee = await employeeService.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const updateData = {
        status,
        notes,
        proofImages,
        actualRecipient,
        actualRecipientPhone,
        codCollected,
        totalAmountCollected,
        shipperId,
        deliveredAt: status === 'delivered' ? new Date() : null
      };

      const result = await orderService.updateOrderStatus(id, updateData, employee.officeId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Emit thông báo khi bắt đầu giao hàng
      if (status === 'delivering') {
        try {
          console.log('Creating delivery start notification for user:', userId, 'office:', employee.officeId);
          
          // Tạo thông báo trong database TRƯỚC
          const notificationResult = await notificationService.createNotification({
            userId: userId,
            officeId: employee.officeId,
            type: 'delivery_started',
            title: 'Bắt đầu giao hàng',
            message: `Bạn đã bắt đầu giao đơn hàng #${id}`,
            relatedId: parseInt(id),
            relatedType: 'order'
          });
          console.log('Delivery start notification result:', notificationResult);
          
          // Emit realtime notification với dữ liệu từ database
          if (notificationResult.success) {
            console.log('Emitting WebSocket delivery start notification...');
            console.log('Notification data to emit:', {
              id: notificationResult.data.id,
              type: notificationResult.data.type,
              title: notificationResult.data.title,
              message: notificationResult.data.message,
              isRead: notificationResult.data.isRead,
              createdAt: notificationResult.data.createdAt
            });
            
            emitToUser(userId, 'notification', {
              id: notificationResult.data.id,
              type: notificationResult.data.type,
              title: notificationResult.data.title,
              message: notificationResult.data.message,
              isRead: notificationResult.data.isRead,
              createdAt: notificationResult.data.createdAt
            });
            console.log('WebSocket delivery start notification sent to user:', userId);
          } else {
            console.log('Failed to create delivery start notification:', notificationResult.message);
          }
        } catch (error) {
          console.error('Error in delivery start notification process:', error);
        }
      }

      return res.json({
        success: true,
        message: 'Cập nhật trạng thái giao hàng thành công',
        data: result.data
      });
    } catch (error) {
      console.error('Update delivery status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy lịch sử giao hàng
  async getDeliveryHistory(req, res) {
    try {
      console.log('=== SHIPPER GET DELIVERY HISTORY START ===');
      console.log('User ID:', req.user.id);
      console.log('Query params:', req.query);
      
      const userId = req.user.id;
      const { page = 1, limit = 10, status, dateFrom, dateTo, route } = req.query;
      
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', employee);
      
      if (!employee) {
        console.log('Employee not found for userId:', userId);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const filters = {
        officeId: employee.officeId,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateFrom,
        dateTo,
        route
      };

      console.log('Filters for delivery history:', filters);
      const result = await orderService.getShipperDeliveryHistory(filters);
      console.log('Delivery history result:', result);

      return res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        stats: result.stats
      });
    } catch (error) {
      console.error('=== SHIPPER GET DELIVERY HISTORY ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Lấy lộ trình giao hàng
  async getDeliveryRoute(req, res) {
    try {
      console.log('=== SHIPPER GET DELIVERY ROUTE START ===');
      console.log('User ID:', req.user.id);
      
      const userId = req.user.id;
      
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', employee);
      
      if (!employee) {
        console.log('Employee not found for userId:', userId);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log('Date range:', { today, tomorrow });
      console.log('Office ID:', employee.officeId);

      const result = await orderService.getShipperRoute(employee.officeId, today, tomorrow, userId);
      console.log('Route result:', result);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('=== SHIPPER GET DELIVERY ROUTE ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Bắt đầu tuyến giao hàng
  async startRoute(req, res) {
    try {
      const userId = req.user.id;
      const { routeId } = req.body;

      const employee = await employeeService.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      // TODO: Implement route starting logic
      // Có thể lưu trạng thái tuyến vào database

      return res.json({
        success: true,
        message: 'Đã bắt đầu tuyến giao hàng'
      });
    } catch (error) {
      console.error('Start route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Báo cáo sự cố
  async reportIncident(req, res) {
    try {
      const userId = req.user.id;
      const { 
        trackingNumber, 
        incidentType, 
        title, 
        description, 
        location, 
        priority,
        recipientName,
        recipientPhone,
        images 
      } = req.body;

      // Lấy thông tin employee để có officeId
      const employee = await employeeService.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      // Tìm đơn hàng theo tracking number và kiểm tra thuộc bưu cục của shipper
      const order = await db.Order.findOne({
        where: { 
          trackingNumber,
          toOfficeId: employee.officeId  // Kiểm tra đơn hàng thuộc bưu cục của shipper
        }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng hoặc bạn không có quyền báo cáo sự cố cho đơn hàng này'
        });
      }

      // Tạo báo cáo sự cố
      const incidentReport = await db.IncidentReport.create({
        orderId: order.id,
        shipperId: userId,
        incidentType,
        title,
        description,
        location,
        priority: priority || 'medium',
        recipientName,
        recipientPhone,
        images: images || [],
        status: 'pending'
      });

      // Gửi thông báo cho admin/manager
      await db.Notification.create({
        userId: userId,
        type: 'incident_report',
        title: 'Báo cáo sự cố mới',
        message: `Shipper đã báo cáo sự cố cho đơn hàng ${trackingNumber}: ${title}`,
        data: {
          incidentReportId: incidentReport.id,
          orderId: order.id,
          trackingNumber
        }
      });

      return res.json({
        success: true,
        message: 'Đã gửi báo cáo sự cố thành công',
        data: incidentReport
      });
    } catch (error) {
      console.error('Report incident error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy danh sách báo cáo sự cố của shipper
  async getIncidentReports(req, res) {
    try {
      console.log('=== GET INCIDENT REPORTS START ===');
      const userId = req.user.id;
      console.log('User ID:', userId);
      const { page = 1, limit = 10, status, priority } = req.query;

      // Lấy thông tin employee để có officeId
      const incidentEmployee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', incidentEmployee);
      
      if (!incidentEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const whereClause = { shipperId: userId };
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;

      console.log('Where clause:', whereClause);
      console.log('Office ID:', incidentEmployee.officeId);

      const { count, rows: reports } = await db.IncidentReport.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.Order,
            as: 'order',
            where: { toOfficeId: incidentEmployee.officeId }, // Chỉ lấy đơn hàng thuộc bưu cục của shipper
            attributes: ['id', 'trackingNumber', 'recipientName', 'recipientPhone', 'status']
          },
          {
            model: db.User,
            as: 'handler',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      console.log('Found reports:', count);
      console.log('Reports data:', reports);

      return res.json({
        success: true,
        data: reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get incident reports error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy chi tiết báo cáo sự cố
  async getIncidentReportDetail(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const report = await db.IncidentReport.findOne({
        where: { 
          id,
          shipperId: userId 
        },
        include: [
          {
            model: db.Order,
            as: 'order',
            include: [
              {
                model: db.User,
                as: 'shipper',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
          },
          {
            model: db.User,
            as: 'handler',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy báo cáo sự cố'
        });
      }

      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get incident report detail error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Quản lý COD
  async getCODTransactions(req, res) {
    try {
      console.log('=== SHIPPER GET COD TRANSACTIONS START ===');
      console.log('User ID:', req.user.id);
      console.log('Query params:', req.query);
      
      const userId = req.user.id;
      const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
      
      const employee = await employeeService.getEmployeeByUserId(userId);
      console.log('Employee found:', employee);
      
      if (!employee) {
        console.log('Employee not found for userId:', userId);
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      const filters = {
        officeId: employee.officeId,
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateFrom,
        dateTo
      };

      console.log('Filters for COD transactions:', filters);
      const result = await orderService.getShipperCODTransactions(filters);
      console.log('COD transactions result:', result);

      return res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
        summary: result.summary
      });
    } catch (error) {
      console.error('=== SHIPPER GET COD TRANSACTIONS ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // Nộp tiền COD
  async submitCOD(req, res) {
    try {
      const userId = req.user.id;
      const { transactionIds, totalAmount, notes } = req.body;

      const employee = await employeeService.getEmployeeByUserId(userId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      // Validate input
      if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ít nhất một giao dịch COD'
        });
      }

      if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền nộp phải lớn hơn 0'
        });
      }

      // Lấy thông tin employee để có officeId
      const shipperEmployee = await employeeService.getEmployeeByUserId(userId);
      if (!shipperEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin nhân viên'
        });
      }

      // Lấy thông tin các đơn hàng COD
      const orders = await db.Order.findAll({
        where: {
          id: transactionIds,
          toOfficeId: shipperEmployee.officeId, // Kiểm tra đơn hàng thuộc bưu cục của shipper
          status: 'delivered',
          cod: { [db.Sequelize.Op.gt]: 0 }
        },
        include: [
          {
            model: db.ShippingCollection,
            as: 'shippingCollections',
            where: { shipperId: userId },
            required: true
          }
        ]
      });

      if (orders.length !== transactionIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một số đơn hàng không hợp lệ hoặc chưa được giao'
        });
      }

      // Tính tổng số tiền COD theo hệ thống
      const expectedAmount = orders.reduce((sum, order) => {
        const collection = order.shippingCollections[0];
        return sum + (collection ? collection.amountCollected : 0);
      }, 0);

      // Tính chênh lệch
      const discrepancy = totalAmount - expectedAmount;

      // Tạo bản ghi PaymentSubmission cho tất cả đơn hàng cùng lúc
      const submission = await db.PaymentSubmission.create({
        orderIds: transactionIds, // Array of order IDs
        officeId: shipperEmployee.officeId,
        submittedById: userId,
        totalAmountSubmitted: totalAmount,
        status: 'Pending',
        notes: notes || `Shipper nộp tiền COD cho ${orders.length} đơn hàng`
      });

      // Gửi thông báo cho admin/manager
      await db.Notification.create({
        userId: userId,
        type: 'cod_submission',
        title: 'Nộp tiền COD',
        message: `Shipper đã nộp ${totalAmount.toLocaleString()}đ COD cho ${orders.length} đơn hàng`,
        data: {
          submissionId: submission.id,
          totalAmount,
          discrepancy,
          orderCount: orders.length,
          orderIds: transactionIds
        }
      });

      return res.json({
        success: true,
        message: 'Đã nộp tiền COD thành công',
        data: {
          submission: submission,
          summary: {
            totalAmount,
            expectedAmount,
            discrepancy,
            orderCount: orders.length
          }
        }
      });
    } catch (error) {
      console.error('Submit COD error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Lấy lịch sử nộp tiền COD
  async getCODSubmissionHistory(req, res) {
    try {
      console.log('=== GET COD SUBMISSION HISTORY START ===');
      const userId = req.user.id;
      console.log('User ID:', userId);
      const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

      const whereClause = { submittedById: userId };
      if (status) whereClause.status = status;
      
      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[db.Sequelize.Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[db.Sequelize.Op.lte] = new Date(dateTo);
      }

      console.log('Where clause:', whereClause);

      const { count, rows: submissions } = await db.PaymentSubmission.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.Office,
            as: 'office',
            attributes: ['id', 'name', 'address']
          },
          {
            model: db.User,
            as: 'submittedBy',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      // Lấy thông tin orders riêng biệt
      const allOrderIds = [];
      submissions.forEach(submission => {
        if (submission.orderIds && Array.isArray(submission.orderIds)) {
          allOrderIds.push(...submission.orderIds);
        }
      });

      let orders = [];
      if (allOrderIds.length > 0) {
        orders = await db.Order.findAll({
          where: { id: allOrderIds },
          attributes: ['id', 'trackingNumber', 'recipientName', 'cod']
        });
      }

      // Map orders to submissions
      const orderMap = {};
      orders.forEach(order => {
        orderMap[order.id] = order;
      });

      // Add orders to each submission và format lại dữ liệu
      const formattedSubmissions = submissions.map(submission => {
        // Convert Sequelize instance to plain object
        const plainSubmission = submission.toJSON ? submission.toJSON() : submission;
        
        // Add orders
        const submissionOrders = [];
        if (plainSubmission.orderIds && Array.isArray(plainSubmission.orderIds)) {
          plainSubmission.orderIds.forEach(orderId => {
            if (orderMap[orderId]) {
              submissionOrders.push(orderMap[orderId]);
            }
          });
        }
        
        // Return formatted object với các trường cần thiết cho frontend
        return {
          ...plainSubmission,
          orders: submissionOrders,
          amount: plainSubmission.totalAmountSubmitted || 0,
          amountSubmitted: plainSubmission.totalAmountSubmitted || 0,
          discrepancy: 0
        };
      });

      console.log('Found submissions:', count);

      // Tính tổng kết
      const summary = await db.PaymentSubmission.findAll({
        where: { submittedById: userId },
        attributes: [
          [db.Sequelize.fn('SUM', db.Sequelize.col('totalAmountSubmitted')), 'totalSubmitted'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'totalSubmissions']
        ],
        raw: true
      });

      console.log('Summary:', summary);

      // Final debug: Log the response structure
      console.log('=== FINAL RESPONSE DEBUG ===');
      console.log('Response structure:');
      console.log('- success: true');
      console.log('- data length:', formattedSubmissions.length);
      console.log('- pagination:', {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      });
      console.log('- summary:', {
        totalSubmitted: summary[0]?.totalSubmitted || 0,
        totalSubmissions: summary[0]?.totalSubmissions || 0
      });
      
      if (formattedSubmissions.length > 0) {
        console.log('First submission in response:');
        console.log('- amountSubmitted:', formattedSubmissions[0].amountSubmitted);
        console.log('- discrepancy:', formattedSubmissions[0].discrepancy);
        console.log('- amount:', formattedSubmissions[0].amount);
      }

      return res.json({
        success: true,
        data: formattedSubmissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit))
        },
        summary: {
          totalSubmitted: summary[0]?.totalSubmitted || 0,
          totalSubmissions: summary[0]?.totalSubmissions || 0
        }
      });
    } catch (error) {
      console.error('Get COD submission history error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

export default shipperController;
