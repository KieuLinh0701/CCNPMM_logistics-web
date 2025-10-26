import { underscoredIf } from "sequelize/lib/utils";
import orderService from "../services/orderService";

const orderController = {
  // ==================== KHU VỰC 1: TỪ HEAD ====================
  async calculateShippingFee(req, res) {
    try {
      const { weight, serviceTypeId, senderCodeCity, recipientCodeCity } = req.query;

      const result = await orderService.calculateShippingFee({
        weight: Number(weight),
        serviceTypeId: Number(serviceTypeId),
        senderCodeCity: Number(senderCodeCity),
        recipientCodeCity: Number(recipientCodeCity),
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Calculate Shipping Fee error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  // Get Statuses Enum
  async getOrderStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await orderService.getOrderStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Get Payment Methods Enum
  async getOrderPaymentMethods(req, res) {
    try {
      const userId = req.user.id;
      const result = await orderService.getOrderPaymentMethods(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Payment Methods Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async createUserOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;
      const result = await orderService.createUserOrder(userId, order);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Create Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        payer: req.query.payer || undefined,
        status: req.query.status || undefined,
        paymentStatus: req.query.paymentStatus || undefined,
        paymentMethod: req.query.paymentMethod || undefined,
        cod: req.query.cod || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await orderService.getUserOrders(userId, page, limit, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Get Orders By User error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  // Get Payment Statuses Enum
  async getOrderPaymentStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await orderService.getOrderPaymentStatuses(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Payment Statuses Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Get Payers Enum
  async getOrderPayers(req, res) {
    try {
      const userId = req.user.id;
      const result = await orderService.getOrderPayers(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Payers Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Cancel Order
  async cancelUserOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;
      const result = await orderService.cancelUserOrder(userId, orderId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Cancel Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi hủy đơn hàng",
      });
    }
  },

  // Get Order By Tracking Number
  async getOrderByTrackingNumber(req, res) {
    try {
      const userId = req.user.id;
      const { trackingNumber } = req.params;
      const result = await orderService.getOrderByTrackingNumber(userId, trackingNumber);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get Order By Tracking Number error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thông tin đơn hàng",
      });
    }
  },

  async updateUserOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;
      console.log("order", order);
      const result = await orderService.updateUserOrder(userId, order);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Update Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật đơn hàng",
      });
    }
  },

  async setOrderToPending(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;
      const result = await orderService.setOrderToPending(userId, orderId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Update Order Status To Pending error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái đơn hàng thành đang xử lý",
      });
    }
  },

  // ==================== Manager ====================================//

  async getOrdersByOfficeId(req, res) {
    try {
      const userId = req.user.id;
      const officeId = parseInt(req.params.officeId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      console.log("search", req.query.search);

      const filters = {
        searchText: req.query.search || undefined,
        payer: req.query.payer || undefined,
        status: req.query.status || undefined,
        paymentStatus: req.query.paymentStatus || undefined,
        paymentMethod: req.query.paymentMethod || undefined,
        cod: req.query.cod || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
        senderWard: parseInt(req.query.senderWard) || undefined,
        recipientWard: parseInt(req.query.recipientWard) || undefined,
      };

      const result = await orderService.getOrdersByOfficeId(userId, officeId, page, limit, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Get Orders By User error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  async confirmAndAssignOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId, officeId } = req.body;
      const result = await orderService.confirmAndAssignOrder(userId, orderId, officeId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Confirm Order And Assign To Office:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái đơn hàng thành xác nhận và xác nhận bưu cục nhận",
      });
    }
  },

  async createManagerOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;
      const result = await orderService.createManagerOrder(userId, order);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Create Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  async cancelManagerOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;
      const result = await orderService.cancelManagerOrder(userId, orderId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Cancel Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi hủy đơn hàng",
      });
    }
  },

  async updateManagerOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;
      const result = await orderService.updateManagerOrder(userId, order);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Update Manager Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật đơn hàng bởi quản lý",
      });
    }
  },

  async getUserOrdersDashboard(req, res) {
    try {
      const userId = req.user.id;

      const startDate = req.query.startDate || undefined;
      const endDate = req.query.endDate || undefined;

      const result = await orderService.getUserOrdersDashboard(userId, startDate, endDate);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Get Orders By User error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  async getShipmentOrders(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        payer: req.query.payer || undefined,
        paymentMethod: req.query.paymentMethod || undefined,
        cod: req.query.cod || undefined,
        sort: req.query.sort || undefined,
      };

      const result = await orderService.getShipmentOrders(userId, id, page, limit, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("getShipmentOrdersError:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy đơn hàng",
      });
    }
  },

  async getManagerOrdersDashboard(req, res) {
    try {
      const userId = req.user.id;

      const startDate = req.query.startDate || undefined;
      const endDate = req.query.endDate || undefined;

      const result = await orderService.getManagerOrdersDashboard(userId, startDate, endDate);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("getManagerOrdersDashboardError:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  // ==================== KHU VỰC 2: TỪ ORIGIN/DAT ====================
  async list(req, res) {
    try {
      const { page, limit, search, status, postOfficeId } = req.query;
      const result = await orderService.listOrders({ page, limit, search, status, postOfficeId });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await orderService.getOrderById(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const result = await orderService.updateOrderStatus(req.params.id, status);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await orderService.deleteOrder(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async trackOrder(req, res) {
    try {
      const { trackingNumber } = req.params;
      const normalized = (trackingNumber || "").trim();
      const result = await orderService.trackOrder(normalized);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createOrder(req, res) {
    try {
      const orderData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Chưa đăng nhập'
        });
      }

      // Validate required fields
      const requiredFields = [
        'senderName', 'senderPhone', 'recipientName', 'recipientPhone',
        'weight', 'serviceTypeId', 'shippingFee'
      ];

      for (const field of requiredFields) {
        if (!orderData[field]) {
          return res.status(400).json({
            success: false,
            message: `Thiếu thông tin bắt buộc: ${field}`
          });
        }
      }

      // Add user ID to order data
      orderData.userId = userId;

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Tạo đơn hàng thành công',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || 'Tạo đơn hàng thất bại'
        });
      }
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  }
};

export default orderController;