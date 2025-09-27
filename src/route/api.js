import express from "express";
import authController from "../controllers/authController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import adminUserController from "../controllers/admin/adminUserController.js";
import adminOfficeController from "../controllers/admin/adminOfficeController.js";
import adminEmployeeController from "../controllers/admin/adminEmployeeController.js";
import adminProductController from "../controllers/admin/adminProductController.js";
import adminServiceTypeController from "../controllers/admin/adminServiceTypeController.js";
import adminShippingRateController from "../controllers/admin/adminShippingRateController.js";
import adminOrderController from "../controllers/admin/adminOrderController.js";
import nodemailer from "nodemailer";
import employeeController from "../controllers/employeeController.js";
import officeController from "../controllers/officeController.js";
import serviceTypeController from "../controllers/serviceTypeController.js";
import orderController from "../controllers/orderController.js";

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

    // Admin - Users CRUD
    router.get('/admin/users', verifyToken, requireRole(['admin']), adminUserController.list);
    router.get('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.getById);
    router.post('/admin/users', verifyToken, requireRole(['admin']), adminUserController.create);
    router.put('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.update);
    router.delete('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.remove);

    // Admin - Offices CRUD (replaces PostOffices)
    router.get('/admin/offices', verifyToken, requireRole(['admin']), adminOfficeController.list);
    router.get('/admin/offices/:id', verifyToken, requireRole(['admin']), adminOfficeController.getById);
    router.post('/admin/offices', verifyToken, requireRole(['admin']), adminOfficeController.create);
    router.put('/admin/offices/:id', verifyToken, requireRole(['admin']), adminOfficeController.update);
    router.delete('/admin/offices/:id', verifyToken, requireRole(['admin']), adminOfficeController.remove);

    // Admin - Employees CRUD
    router.get('/admin/employees', verifyToken, requireRole(['admin']), adminEmployeeController.list);
    router.get('/admin/employees/:id', verifyToken, requireRole(['admin']), adminEmployeeController.getById);
    router.post('/admin/employees', verifyToken, requireRole(['admin']), adminEmployeeController.create);
    router.put('/admin/employees/:id', verifyToken, requireRole(['admin']), adminEmployeeController.update);
    router.delete('/admin/employees/:id', verifyToken, requireRole(['admin']), adminEmployeeController.remove);

    // Admin - Products CRUD
    router.get('/admin/products', verifyToken, requireRole(['admin']), adminProductController.list);
    router.get('/admin/products/:id', verifyToken, requireRole(['admin']), adminProductController.getById);
    router.post('/admin/products', verifyToken, requireRole(['admin']), adminProductController.create);
    router.put('/admin/products/:id', verifyToken, requireRole(['admin']), adminProductController.update);
    router.delete('/admin/products/:id', verifyToken, requireRole(['admin']), adminProductController.remove);

    // Admin - Service Types CRUD
    router.get('/admin/servicetypes', verifyToken, requireRole(['admin']), adminServiceTypeController.list);
    router.get('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.getById);
    router.post('/admin/servicetypes', verifyToken, requireRole(['admin']), adminServiceTypeController.create);
    router.put('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.update);
    router.delete('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.remove);

    // Admin - Shipping Rates CRUD
    router.get('/admin/shippingrates', verifyToken, requireRole(['admin']), adminShippingRateController.list);
    router.get('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), adminShippingRateController.getById);
    router.post('/admin/shippingrates', verifyToken, requireRole(['admin']), adminShippingRateController.create);
    router.put('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), adminShippingRateController.update);
    router.delete('/admin/shippingrates/:id', verifyToken, requireRole(['admin']), adminShippingRateController.remove);
    router.get('/admin/shippingrates/calculate', verifyToken, requireRole(['admin']), adminShippingRateController.calculateCost);

    // Admin - Orders CRUD
    router.get('/admin/orders', verifyToken, requireRole(['admin']), adminOrderController.list);
    router.get('/admin/orders/:id', verifyToken, requireRole(['admin']), adminOrderController.getById);
    router.put('/admin/orders/:id/status', verifyToken, requireRole(['admin']), adminOrderController.updateStatus);
    router.delete('/admin/orders/:id', verifyToken, requireRole(['admin']), adminOrderController.remove);

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