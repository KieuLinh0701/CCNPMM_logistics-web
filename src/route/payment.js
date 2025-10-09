import express from "express";
import { verifyToken } from "../middleware/auth.js";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Tạo QR thanh toán VNPay
router.post("/create-url", verifyToken, paymentController.createVNPayURL);

// Check trạng thái thanh toán VNPay
router.get("/check-vnpay", paymentController.checkVNPayPayment);

export default router;