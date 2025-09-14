import express from "express";
import authController from "../controllers/authController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import adminUserController from "../controllers/adminUserController.js";
import adminPostOfficeController from "../controllers/adminPostOfficeController.js";
import adminServiceTypeController from "../controllers/adminServiceTypeController.js";
import adminOrderController from "../controllers/adminOrderController.js";
import nodemailer from "nodemailer";

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

    // Admin - Users CRUD
    router.get('/admin/users', verifyToken, requireRole(['admin']), adminUserController.list);
    router.get('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.getById);
    router.post('/admin/users', verifyToken, requireRole(['admin']), adminUserController.create);
    router.put('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.update);
    router.delete('/admin/users/:id', verifyToken, requireRole(['admin']), adminUserController.remove);

    // Admin - Post Offices CRUD
    router.get('/admin/postoffices', verifyToken, requireRole(['admin']), adminPostOfficeController.list);
    router.get('/admin/postoffices/:id', verifyToken, requireRole(['admin']), adminPostOfficeController.getById);
    router.post('/admin/postoffices', verifyToken, requireRole(['admin']), adminPostOfficeController.create);
    router.put('/admin/postoffices/:id', verifyToken, requireRole(['admin']), adminPostOfficeController.update);
    router.delete('/admin/postoffices/:id', verifyToken, requireRole(['admin']), adminPostOfficeController.remove);

    // Admin - Service Types CRUD
    router.get('/admin/servicetypes', verifyToken, requireRole(['admin']), adminServiceTypeController.list);
    router.get('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.getById);
    router.post('/admin/servicetypes', verifyToken, requireRole(['admin']), adminServiceTypeController.create);
    router.put('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.update);
    router.delete('/admin/servicetypes/:id', verifyToken, requireRole(['admin']), adminServiceTypeController.remove);

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
