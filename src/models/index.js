import { Sequelize } from 'sequelize';
import config from '../config/config.json' with { type: "json" };

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging
  }
);

// Import models
import User from './user.js';
import OTP from './otp.js';
import Office from './office.js';
import Employee from './employee.js';
import ServiceType from './serviceType.js';
import Order from './order.js';
import OrderHistory from './orderHistory.js';
import Promotion from './promotion.js';
import Region from './region.js';
import Shipment from './shipment.js';
import ShipmentOrder from './shipmentOrder.js';
import ShippingRate from './shippingRate.js';
import Vehicle from './vehicle.js';
import Product from './product.js';
import OrderProduct from './orderProduct.js';
import ShippingCollection from './shippingCollection.js';
import ShippingRequest from './shippingRequest.js';
import Notification from './notification.js';
import PaymentSubmission from './paymentSubmission.js';
import Transaction from './transaction.js';
import TransactionImage from './transactionImage.js';
import IncidentReport from './incidentReport.js';

// Initialize models
const db = {
  sequelize,
  Sequelize,
  User: User(sequelize),
  OTP: OTP(sequelize),
  Office: Office(sequelize),
  Employee: Employee(sequelize),
  ServiceType: ServiceType(sequelize),
  Order: Order(sequelize),
  OrderHistory: OrderHistory(sequelize),
  Promotion: Promotion(sequelize),
  Region: Region(sequelize),
  Shipment: Shipment(sequelize),
  ShipmentOrder: ShipmentOrder(sequelize),
  ShippingRate: ShippingRate(sequelize),
  Vehicle: Vehicle(sequelize),
  Product: Product(sequelize),
  OrderProduct: OrderProduct(sequelize),
  ShippingCollection: ShippingCollection(sequelize),
  ShippingRequest: ShippingRequest(sequelize),
  Notification: Notification(sequelize),
  PaymentSubmission: PaymentSubmission(sequelize),
  Transaction: Transaction(sequelize),
  TransactionImage: TransactionImage(sequelize),
  IncidentReport: IncidentReport(sequelize),
};

// Call associate for each model if exists
Object.values(db).forEach((model) => {
  if (model?.associate) {
    model.associate(db);
  }
});

export default db;