import express from "express";
import authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import employeeController from "../controllers/employeeController.js";
import officeController from "../controllers/officeController.js";
import serviceTypeController from "../controllers/serviceTypeController.js";
import orderController from "../controllers/orderController.js";
import productController from "../controllers/productController.js";
import promotionController from "../controllers/promotionController.js";
import payment from "./payment.js";
import vehicleController from "../controllers/vehicleController.js";
import requestController from "../controllers/requestController.js";

let router = express.Router();

let initApiRoutes = (app) => {
    // Auth routes
    router.post('/auth/register', authController.register);
    router.post('/auth/verify-otp', authController.verifyOTP);
    router.post('/auth/login', authController.login);
    router.get('/auth/profile', verifyToken, authController.getProfile);
    router.post('/auth/password/forgot', authController.forgotPassword);
    router.post('/auth/password/verify-otp', authController.verifyResetOTP);
    router.post('/auth/password/reset', authController.resetPassword);
    router.get('/auth/roles/assignable', verifyToken, authController.getAssignableRoles);

    // Office routes
    router.get('/me/office', verifyToken, officeController.getOfficeByUser);
    router.put('/offices/:id', verifyToken, officeController.update);
    router.get('/offices', officeController.getOfficesByArea);

    // Employee routes
    router.get('/employees/shifts', verifyToken, employeeController.getShiftEnum);
    router.get('/employees/status', verifyToken, employeeController.getStatusEnum);
    router.get('/employees/by-office/:id', verifyToken, employeeController.getEmployeesByOffice);
    router.post('/employees/add', verifyToken, employeeController.addEmployee);
    router.get("/employees/check-before-add", verifyToken, employeeController.checkBeforeAddEmployee);
    router.put("/employees/:id", verifyToken, employeeController.updateEmployee);
    router.post('/employees/import', verifyToken, employeeController.importEmployees);

    // Service Type routes
    router.get("/services/get-active", serviceTypeController.getActiveServiceTypes);

    // Order Routes
    router.get("/orders/calculate-shipping-fee", orderController.calculateShippingFee);
    router.get('/orders/statuses', verifyToken, orderController.getStatusesEnum);
    router.get('/orders/payment-methods', verifyToken, orderController.getPaymentMethodsEnum);
    router.post('/orders/create', verifyToken, orderController.createOrder);
    router.get('/orders/by-user', verifyToken, orderController.getOrdersByUser);
    router.get('/orders/payers', verifyToken, orderController.getPayersEnum);
    router.get('/orders/payment-statuses', verifyToken, orderController.getPaymentStatuesEnum);
    router.put('/orders/cancel', verifyToken, orderController.cancelOrder);
    router.get('/orders/:trackingNumber', verifyToken, orderController.getOrderByTrackingNumber);
    router.put('/orders/edit', verifyToken, orderController.updateOrder);
    router.put('/orders/to-pending', verifyToken, orderController.updateOrderStatusToPending);
    router.get('/orders/by-office/:officeId', verifyToken, orderController.getOrdersByOffice);
    router.put('/orders/confirm', verifyToken, orderController.confirmOrderAndAssignToOffice);

    // Product Routes
    router.get("/products", verifyToken, productController.getProductsByUser);
    router.get('/products/types', verifyToken, productController.getTypesEnum);
    router.get('/products/statuses', verifyToken, productController.getStatusesEnum);
    router.post('/products/add', verifyToken, productController.addProduct);
    router.put("/products/:id", verifyToken, productController.updateProduct);
    router.post('/products/import', verifyToken, productController.importProducts);
    router.get("/products/get-active", verifyToken, productController.getActiveProductsByUser);

    // Promotion Routes
    router.get("/promotions/get-active", promotionController.getActivePromotions);

    // Vehicle Routes
    router.get('/vehicles/types', verifyToken, vehicleController.getTypesEnum);
    router.get('/vehicles/statuses', verifyToken, vehicleController.getStatusesEnum);
    router.get('/vehicles/by-office/:officeId', verifyToken, vehicleController.getVehiclesByOffice);
    router.post('/vehicles/add/:officeId', verifyToken, vehicleController.addVehicle);
    router.put('/vehicles/:id', verifyToken, vehicleController.updateVehicle);
    router.post('/vehicles/import/:id', verifyToken, vehicleController.importVehicles);

    // Requests Routes
    router.get('/requests', verifyToken, requestController.getRequestsByUser);
    router.get('/requests/get-types', verifyToken, requestController.getTypesEnum);
    router.get('/requests/get-statuses', verifyToken, requestController.getStatusesEnum);
    router.put('/requests/cancel', verifyToken, requestController.cancelRequest);
    router.post('/requests', verifyToken, requestController.addRequest);
    router.put('/requests/:id', verifyToken, requestController.updateRequest);
    router.get('/requests/by-office/:officeId', verifyToken, requestController.getRequestsByOffice);

    // VNPAY
    router.use("/payment", payment);
    
    // Test routes
    router.get('/test', (req, res) => {
        return res.json({
            message: 'API is working!'
        });
    });

    // Test email route
    router.get('/test-email', async (req, res) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Gửi cho chính mình để test
                subject: 'Test Email Service',
                html: '<h2>Email service is working!</h2><p>Nếu bạn nhận được email này, email service đã hoạt động bình thường.</p>'
            };

            await transporter.sendMail(mailOptions);
            return res.json({
                success: true,
                message: 'Test email sent successfully!'
            });
        } catch (error) {
            console.error('Test email error:', error);
            return res.status(500).json({
                success: false,
                message: 'Email service error: ' + error.message
            });
        }
    });

    return app.use("/api", router);
};

export default initApiRoutes;