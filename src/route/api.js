import express from "express";
import authController from "../controllers/authController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import nodemailer from "nodemailer";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import userController from "../controllers/userController.js";
import officeController from "../controllers/officeController.js";
import employeeController from "../controllers/employeeController.js";
import productController from "../controllers/productController.js"; // ✅ GIỮ LẠI
import serviceTypeController from "../controllers/serviceTypeController.js";
import shippingRateController from "../controllers/shippingRateController.js";
import vehicleController from "../controllers/vehicleController.js"; // ✅ GIỮ LẠI
// import productController from "../controllers/productController.js"; // ❌ XÓA DÒNG NÀY (trùng)
import promotionController from "../controllers/promotionController.js"; // ✅ GIỮ LẠI
import payment from "./payment.js";
// import vehicleController from "../controllers/vehicleController.js"; // ❌ XÓA DÒNG NÀY (trùng)
import shippingRequestController from "../controllers/shippingRequestController.js";
import shipperController from "../controllers/shipperController.js";
import orderController from "../controllers/orderController.js";
// import * as promotionController from "../controllers/promotionController.js"; // ❌ XÓA DÒNG NÀY (trùng cả tên và module)

let router = express.Router();

let initApiRoutes = (app) => {
    // Static serve uploads
    const uploadRoot = 'C:/uploads';
    if (!fs.existsSync(uploadRoot)) {
        try { fs.mkdirSync(uploadRoot, { recursive: true }); } catch (_) {}
    }
    app.use('/uploads', express.static(uploadRoot));
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadRoot),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
            cb(null, `${base}-${Date.now()}${ext}`);
        },
    });
    const upload = multer({ storage });
    // Auth routes
    router.post('/auth/register', authController.register);
    router.post('/auth/verify-otp', authController.verifyOTP);
    router.post('/auth/login', authController.login);
    router.get('/auth/profile', verifyToken, authController.getProfile);
    router.put('/auth/profile', verifyToken, authController.updateProfile);
    router.put('/auth/profile/avatar', verifyToken, upload.single('avatar'), authController.updateAvatar);
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
    router.post('/orders/create', verifyToken, orderController.createOrderOfLinh);
    router.get('/orders/by-user', verifyToken, orderController.getOrdersByUser);
    router.get('/orders/payers', verifyToken, orderController.getPayersEnum);
    router.get('/orders/payment-statuses', verifyToken, orderController.getPaymentStatusesEnum);
    router.put('/orders/cancel', verifyToken, orderController.cancelOrder);
    router.get('/orders/:trackingNumber', verifyToken, orderController.getOrderByTrackingNumber);
    router.put('/orders/edit', verifyToken, orderController.updateOrder);
    router.put('/orders/to-pending', verifyToken, orderController.updateOrderStatusToPending);
    router.get('/orders/by-office/:officeId', verifyToken, orderController.getOrdersByOffice);
    router.put('/orders/confirm', verifyToken, orderController.confirmOrderAndAssignToOffice);
    router.post("/orders", verifyToken, orderController.createOrder);
    
    // Promotion validation for orders
    router.post("/orders/validate-promotion", promotionController.validatePromotionCode);
    
    // Public routes for guests
    // Order tracking
    router.get("/public/orders/track/:trackingNumber", orderController.trackOrder);
    
    // Office search
    router.get("/public/offices/search", officeController.searchOffices);
    router.get("/public/offices", officeController.getPublicOffices);
    
    // Service types for public
    router.get("/public/services", serviceTypeController.getPublicServiceTypes);
    
    // Shipping rates for public
    router.get("/public/shipping-rates", shippingRateController.getPublicShippingRates);
    
    // Company information
    router.get("/public/company-info", (req, res) => {
        return res.json({
            success: true,
            data: {
                name: "CCNPMM Logistics",
                description: "Dịch vụ vận chuyển hàng hóa chuyên nghiệp",
                address: "123 Đường ABC, Quận XYZ, TP.HCM",
                phone: "1900-1234",
                email: "info@ccnpmm.com",
                website: "www.ccnpmm.com"
            }
        });
    });
    
    // Contact form submission
    router.post("/public/contact", (req, res) => {
        const { name, email, phone, subject, message } = req.body;
        // TODO: Implement email sending for contact form
        return res.json({
            success: true,
            message: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất."
        });
    });


    // Admin - Users CRUD
    router.get('/admin/users', verifyToken, requireRole(['admin']), userController.list);
    router.get('/admin/users/:id', verifyToken, requireRole(['admin']), userController.getById);
    router.post('/admin/users', verifyToken, requireRole(['admin']), userController.create);
    router.put('/admin/users/:id', verifyToken, requireRole(['admin']), userController.update);
    router.delete('/admin/users/:id', verifyToken, requireRole(['admin']), userController.remove);

    // Admin - Offices CRUD
    router.get('/admin/offices', verifyToken, requireRole(['admin']), officeController.list);
    router.get('/admin/offices/:id', verifyToken, requireRole(['admin']), officeController.getById);
    router.post('/admin/offices', verifyToken, requireRole(['admin']), officeController.create);
    router.put('/admin/offices/:id', verifyToken, requireRole(['admin']), officeController.adminUpdate);
    router.delete('/admin/offices/:id', verifyToken, requireRole(['admin']), officeController.remove);

    // Admin - Employees CRUD
    router.get('/admin/employees', verifyToken, requireRole(['admin']), employeeController.list);
    router.get('/admin/employees/:id', verifyToken, requireRole(['admin']), employeeController.getById);
    router.post('/admin/employees', verifyToken, requireRole(['admin']), employeeController.create);
    router.put('/admin/employees/:id', verifyToken, requireRole(['admin']), employeeController.update);
    router.delete('/admin/employees/:id', verifyToken, requireRole(['admin']), employeeController.remove);

    // Admin - Products CRUD
    router.get('/admin/products', verifyToken, requireRole(['admin']), productController.list);
    router.get('/admin/products/:id', verifyToken, requireRole(['admin']), productController.getById);
    router.post('/admin/products', verifyToken, requireRole(['admin']), productController.create);
    router.put('/admin/products/:id', verifyToken, requireRole(['admin']), productController.update);
    router.delete('/admin/products/:id', verifyToken, requireRole(['admin']), productController.remove);

    // Admin - Service Types CRUD
    router.get('/admin/servicetypes', verifyToken, requireRole(['admin']), serviceTypeController.list);
    router.get('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), serviceTypeController.getById);
    router.post('/admin/servicetypes', verifyToken, requireRole(['admin']), serviceTypeController.create);
    router.put('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), serviceTypeController.update);
    router.delete('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), serviceTypeController.remove);

    // Admin - Shipping Rates CRUD
    router.get('/admin/shippingrates', verifyToken, requireRole(['admin']), shippingRateController.list);
    router.get('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), shippingRateController.getById);
    router.post('/admin/shippingrates', verifyToken, requireRole(['admin']), shippingRateController.create);
    router.put('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), shippingRateController.update);
    router.delete('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), shippingRateController.remove);
    router.get('/admin/shippingrates/calculate', verifyToken, requireRole(['admin']), shippingRateController.calculateCost);

    // Admin - Orders CRUD
    router.get('/admin/orders', verifyToken, requireRole(['admin']), orderController.list);
    router.get('/admin/orders/:id', verifyToken, requireRole(['admin']), orderController.getById);
    router.put('/admin/orders/:id/status', verifyToken, requireRole(['admin']), orderController.updateStatus);
    router.delete('/admin/orders/:id', verifyToken, requireRole(['admin']), orderController.remove);

    // Admin - Vehicles CRUD
    router.get('/admin/vehicles', verifyToken, requireRole(['admin']), vehicleController.list);
    router.get('/admin/vehicles/:id', verifyToken, requireRole(['admin']), vehicleController.getById);
    router.post('/admin/vehicles', verifyToken, requireRole(['admin']), vehicleController.create);
    router.put('/admin/vehicles/:id', verifyToken, requireRole(['admin']), vehicleController.update);
    router.delete('/admin/vehicles/:id', verifyToken, requireRole(['admin']), vehicleController.remove);
    router.get('/admin/vehicles/stats', verifyToken, requireRole(['admin']), vehicleController.getStats);

    // Admin - Promotions CRUD
    router.get('/admin/promotions', verifyToken, requireRole(['admin']), promotionController.getAllPromotions);
    router.get('/admin/promotions/:id', verifyToken, requireRole(['admin']), promotionController.getPromotionById);
    router.post('/admin/promotions', verifyToken, requireRole(['admin']), promotionController.createPromotion);
    router.put('/admin/promotions/:id', verifyToken, requireRole(['admin']), promotionController.updatePromotion);
    router.delete('/admin/promotions/:id', verifyToken, requireRole(['admin']), promotionController.deletePromotion);
    router.put('/admin/promotions/:id/status', verifyToken, requireRole(['admin']), promotionController.updatePromotionStatus);
    router.get('/admin/promotions/stats', verifyToken, requireRole(['admin']), promotionController.getPromotionStats);

    // SHIPPER
    // Shipper Dashboard
    router.get('/shipper/dashboard', verifyToken, requireRole(['shipper']), shipperController.getDashboard);
    
    // Shipper Orders
    router.get('/shipper/orders', verifyToken, requireRole(['shipper']), shipperController.getOrders);
    router.get('/shipper/orders/:id', verifyToken, requireRole(['shipper']), shipperController.getOrderDetail);
    router.put('/shipper/orders/:id/status', verifyToken, requireRole(['shipper']), shipperController.updateDeliveryStatus);
    
    // Shipper History
    router.get('/shipper/history', verifyToken, requireRole(['shipper']), shipperController.getDeliveryHistory);
    
    // Shipper Route
    router.get('/shipper/route', verifyToken, requireRole(['shipper']), shipperController.getDeliveryRoute);
    router.post('/shipper/route/start', verifyToken, requireRole(['shipper']), shipperController.startRoute);
    
    // Shipper COD Management
    router.get('/shipper/cod', verifyToken, requireRole(['shipper']), shipperController.getCODTransactions);
    router.post('/shipper/cod/submit', verifyToken, requireRole(['shipper']), shipperController.submitCOD);
    
    // Shipper Incident Report
    router.post('/shipper/incident', verifyToken, requireRole(['shipper']), shipperController.reportIncident);

    // Shipper self-assign
    router.get('/shipper/orders-unassigned', verifyToken, requireRole(['shipper']), shipperController.getUnassignedOrders);
    router.post('/shipper/orders/:id/claim', verifyToken, requireRole(['shipper']), shipperController.claimOrder);
    router.post('/shipper/orders/:id/unclaim', verifyToken, requireRole(['shipper']), shipperController.unclaimOrder);

    // Product Routes
    router.get("/products", verifyToken, productController.listUserProducts);
    router.get('/products/types', verifyToken, productController.getProductTypes);
    router.get('/products/statuses', verifyToken, productController.getProductStatuses);
    router.post('/products/add', verifyToken, productController.createProduct);
    router.put("/products/:id", verifyToken, productController.updateProduct);
    router.post('/products/import', verifyToken, productController.importProducts);
    router.get("/products/get-active", verifyToken, productController.listActiveUserProducts);

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
    router.get('/requests', verifyToken, shippingRequestController.listUserRequests);
    router.get('/requests/types', verifyToken, shippingRequestController.getRequestTypes);
    router.get('/requests/statuses', verifyToken, shippingRequestController.getRequestStatuses);
    router.put('/requests/cancel', verifyToken, shippingRequestController.cancelRequest);
    router.post('/requests', verifyToken, shippingRequestController.createRequest);
    router.put('/requests/:id', verifyToken, shippingRequestController.updateRequest);
    router.get('/requests/office/:officeId', verifyToken, shippingRequestController.listOfficeRequests);

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