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
};

export default orderController;
