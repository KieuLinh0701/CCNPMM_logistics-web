import { underscoredIf } from "sequelize/lib/utils";
import orderService from "../services/orderService";

const orderController = {
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
  async getStatusesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await orderService.getStatusesEnum(userId);

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
  async getPaymentMethodsEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await orderService.getPaymentMethodsEnum(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Payment Methods Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;

      const result = await orderService.createOrder(userId, order);

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

  async getOrdersByUser(req, res) {
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

      const result = await orderService.getOrdersByUser(userId, page, limit, filters);

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

  // Get Payment Methods Enum
  async getPaymentStatuesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await orderService.getPaymentStatusesEnum(userId);

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
  async getPayersEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await orderService.getPayersEnum(userId);

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
  async cancelOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;

      const result = await orderService.cancelOrder(userId, orderId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Cancel Order error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi hủy đơn hàng",
      });
    }
  },

  // Get Order By Id
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

  async updateOrder(req, res) {
    try {
      const userId = req.user.id;
      const order = req.body;

      console.log("order", order);

      const result = await orderService.updateOrder(userId, order);

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

  async updateOrderStatusToPending(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;

      const result = await orderService.updateOrderStatusToPending(userId, orderId);

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

  async getOrdersByOffice(req, res) {
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

      const result = await orderService.getOrdersByOffice(userId, officeId, page, limit, filters);

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

  async confirmOrderAndAssignToOffice(req, res) {
    try {
      const userId = req.user.id;

      const { orderId, officeId } = req.body;

      const result = await orderService.confirmOrderAndAssignToOffice(userId, orderId, officeId);

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
};

export default orderController;
