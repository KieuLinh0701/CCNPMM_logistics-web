import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import initWebRoutes from './route/web.js';
import initApiRoutes from './route/api.js';
import connectDB from './config/configdb.js';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './socket.js';
dotenv.config();
// import db from './models/index.js';


const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay')

let app = express();

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
initWebRoutes(app);
initApiRoutes(app);

// Connect database
connectDB();

// Initialize socket server
initSocket(httpServer);

// (async () => {
//     try {
//         await connectDB();  // authenticate
//         await db.sequelize.sync({ alter: true }); // tạo/ cập nhật bảng
//     } catch (error) {
//         console.error("Database connection or sync failed:", error);
//     }
// })();

let port = process.env.PORT || 8088;

httpServer.listen(port, () => {
    console.log("Backend Nodejs is running on the port: " + port);
});
