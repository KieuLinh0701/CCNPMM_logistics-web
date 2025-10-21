import orderService from '../services/orderService.js';
import employeeService from '../services/employeeService.js';
import notificationService from '../services/notificationService.js';
import { emitToUser } from '../socket.js';
import { Op } from 'sequelize';

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
      if (status === 'in_transit') {
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

      // TODO: Implement incident reporting
      // Có thể tạo bảng IncidentReports trong database

      return res.json({
        success: true,
        message: 'Đã gửi báo cáo sự cố thành công'
      });
    } catch (error) {
      console.error('Report incident error:', error);
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

      // TODO: Implement COD submission
      // Có thể tạo bảng CODSubmissions trong database

      return res.json({
        success: true,
        message: 'Đã nộp tiền COD thành công'
      });
    } catch (error) {
      console.error('Submit COD error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

export default shipperController;
