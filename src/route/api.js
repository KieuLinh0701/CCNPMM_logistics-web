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
import productController from "../controllers/productController.js";
import serviceTypeController from "../controllers/serviceTypeController.js";
import shippingRateController from "../controllers/shippingRateController.js";
import vehicleController from "../controllers/vehicleController.js";
import orderController from "../controllers/orderController.js";
import shipperController from "../controllers/shipperController.js";

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

    // Employee routes
    router.get('/employees/shifts', verifyToken, employeeController.getShiftEnum);
    router.get('/employees/status', verifyToken, employeeController.getStatusEnum);
    router.get('/employees/by-office/:id', verifyToken, employeeController.getEmployeesByOffice);
    router.post('/employees/add', verifyToken, employeeController.addEmployee);
    router.get("/employees/check-before-add", verifyToken, employeeController.checkBeforeAddEmployee);
    router.put("/employees/update/:id", verifyToken, employeeController.updateEmployee);
    router.post('/employees/import', verifyToken, employeeController.importEmployees);

    // Service Type routes
    router.get("/services/get-active", serviceTypeController.getActiveServiceTypes);

    // Order Routes
    router.get("/orders/calculate-shipping-fee", orderController.calculateShippingFee);
    
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