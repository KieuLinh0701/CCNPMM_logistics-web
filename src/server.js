import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import initWebRoutes from './route/web.js';
import initApiRoutes from './route/api.js';
import connectDB from './config/configdb.js';
import dotenv from 'dotenv';
dotenv.config();

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay')

let app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
initWebRoutes(app);
initApiRoutes(app);

// Connect database
connectDB();

let port = process.env.PORT || 8088;

app.listen(port, () => {
    console.log("Backend Nodejs is running on the port: " + port);
});
