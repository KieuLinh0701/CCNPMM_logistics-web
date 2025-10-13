import db from '../models';
import { VNPay, VnpLocale, dateFormat } from 'vnpay';

const paymentService = {
  // Create VNPay URL
  async createVNPayURL(userId, orderId, ip) {
    try {
      // 1. Kiểm tra user tồn tại
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // 2. Tìm order theo id 
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      // 3. Tính totalAmount = shippingFee - discountAmount
      const shippingFee = Number(order.shippingFee) || 0;
      const discountAmount = Number(order.discountAmount) || 0;
      const totalAmount = shippingFee - discountAmount;

      if (totalAmount <= 0) {
        return res.status(400).json({ message: "Số tiền thanh toán không hợp lệ" });
      }

      // 4. Khởi tạo VNPay
      const vnpay = new VNPay({
        tmnCode: process.env.VNPAY_TMN_CODE,
        secureSecret: process.env.VNPAY_SECRET,
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: "SHA512",
        loggerFn: () => { },
      });

      const now = new Date();
      // Thêm 20 phút
      const expire = new Date(now.getTime() + 20 * 60 * 1000); // 20 phút = 20*60*1000 ms

      // 5. Tạo URL thanh toán
      const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: totalAmount * 100, // VNPay yêu cầu số tiền * 100 (đơn vị = đồng)
        vnp_IpAddr: ip,
        vnp_TxnRef: order.id,
        vnp_OrderInfo: `Thanh toán đơn hàng ${order.trackingNumber}`,
        vnp_OrderType: "other",
        vnp_ReturnUrl: `${process.env.CLIENT_URL}/user/orders/success/${order.trackingNumber}`,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(expire),
      });

      return {
        success: true,
        message: "Tạo URL thanh toán thành công",
        paymentUrl: vnpayResponse
      };
    } catch (error) {
      console.error("Create VNPay URL error:", error);
      return res.status(500).json({ message: "Error creating VNPay QR" });
    }
  },

  async refundVNPay(orderId) {
    try {
      // 1. Lấy đơn hàng
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        return { success: false, message: "Đơn hàng không tồn tại" };
      }

      // 2. Tính totalAmount = shippingFee - discountAmount
      const shippingFee = Number(order.shippingFee) || 0;
      const discountAmount = Number(order.discountAmount) || 0;
      const totalAmount = shippingFee - discountAmount;

      // 3. Khởi tạo VNPay
      const vnpay = new VNPay({
        tmnCode: process.env.VNPAY_TMN_CODE,
        secureSecret: process.env.VNPAY_SECRET,
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: "SHA512",
        loggerFn: () => { },
      });

      // 4. Gọi API refund
      const vnpRefundResponse = await vnpay.refund({
        vnp_TxnRef: order.id,
        vnp_Amount: totalAmount * 100,
        vnp_OrderInfo: `Hoàn tiền đơn hàng ${order.trackingNumber}`,
        vnp_CreateDate: dateFormat(new Date()),
      });

      if (vnpRefundResponse) {
        console.log("vnpRefundResponse", vnpRefundResponse);
      } else {
        console.error("vnpRefundResponse is empty, refund failed");
      }

      // 5. Xử lý kết quả
      if (vnpRefundResponse && vnpRefundResponse.vnp_ResponseCode === "00") {
        return { success: true, message: "Hoàn tiền thành công", data: vnpRefundResponse };
      } else {
        return { success: false, message: "Hoàn tiền thất bại", data: vnpRefundResponse };
      }

    } catch (error) {
      console.error("VNPay refund error:", error);
      return { success: false, message: "Lỗi khi hoàn tiền" };
    }
  },
};

export default paymentService;