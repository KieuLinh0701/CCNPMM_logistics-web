import orderService from "../services/orderService";
import paymentService from "../services/paymentService";

const paymentController = {
    async createVNPayURL(req, res) {
        try {
            const userId = req.user.id;

            const { orderId } = req.body;

            const result = await paymentService.createVNPayURL(userId, orderId, req.ip);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Create URL VNPay error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    async checkVNPayPayment(req, res) {

        try {
            const query = req.query;
            const { vnp_ResponseCode, vnp_TxnRef } = query;

            console.log("vnp_TxnRef", vnp_TxnRef);

            if (vnp_ResponseCode === "00") {
                // Thanh toán thành công
                const orderId = vnp_TxnRef;
                const result = await orderService.updatePaymentStatus(orderId);

                return res.json({ success: true, message: "Thanh toán thành công" });
            } else {
                return res.json({ success: false, message: "Thanh toán thất bại hoặc hủy" });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error processing payment result" });
        }
    },
};

export default paymentController;