import express from "express";
import homeController from "../controllers/homeController.js";

let router = express.Router();

let initWebRoutes = (app) => {
    // Web routes
    router.get('/', (req, res) => {
        return res.json({
            message: 'Hệ thống Quản lý Logistic API',
            version: '1.0.0',
            author: 'dd'
        });
    });

    router.get('/home', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);

    return app.use("/", router);
};

export default initWebRoutes;
