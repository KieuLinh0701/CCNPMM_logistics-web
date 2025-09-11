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

// Initialize models
const db = {
  sequelize,
  Sequelize,
  User: User(sequelize),
  OTP: OTP(sequelize),
  Office: Office(sequelize),
  Employee: Employee(sequelize),
};

// Gọi associate cho từng model nếu có
Object.values(db).forEach((model) => {
  if (model?.associate) {
    model.associate(db);
  }
});

export default db;