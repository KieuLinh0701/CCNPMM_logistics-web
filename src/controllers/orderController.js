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
