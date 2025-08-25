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

// Initialize models
const UserModel = User(sequelize);
const OTPModel = OTP(sequelize);

// Define associations
if (UserModel.associate) {
  UserModel.associate({ User: UserModel, OTP: OTPModel });
}

if (OTPModel.associate) {
  OTPModel.associate({ User: UserModel, OTP: OTPModel });
}

const db = {
  sequelize,
  Sequelize,
  User: UserModel,
  OTP: OTPModel
};

export default db;




