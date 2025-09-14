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
import PostOffice from './postoffice.js';
import ServiceType from './servicetype.js';
import Order from './order.js';

// Initialize models
const UserModel = User(sequelize);
const OTPModel = OTP(sequelize);
const PostOfficeModel = PostOffice(sequelize);
const ServiceTypeModel = ServiceType(sequelize);
const OrderModel = Order(sequelize);

// Define associations
if (UserModel.associate) {
  UserModel.associate({ User: UserModel, OTP: OTPModel });
}

if (OTPModel.associate) {
  OTPModel.associate({ User: UserModel, OTP: OTPModel });
}

if (PostOfficeModel.associate) {
  PostOfficeModel.associate({ PostOffice: PostOfficeModel, ServiceType: ServiceTypeModel, Order: OrderModel });
}

if (ServiceTypeModel.associate) {
  ServiceTypeModel.associate({ PostOffice: PostOfficeModel, ServiceType: ServiceTypeModel, Order: OrderModel });
}

if (OrderModel.associate) {
  OrderModel.associate({ PostOffice: PostOfficeModel, ServiceType: ServiceTypeModel, Order: OrderModel });
}

// Auto sync database
const syncDatabase = async () => {
  try {
    console.log('🔄 Auto-syncing database...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully!');
    
    // Add sample data if tables are empty
    const postOfficeCount = await PostOfficeModel.count();
    if (postOfficeCount === 0) {
      console.log('🔄 Adding sample post offices...');
      await PostOfficeModel.bulkCreate([
        {
          name: 'Bưu cục Quận 1',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          phone: '028-1234567',
          workingHours: '8:00-17:00',
          area: 'Quận 1',
          status: 'active'
        },
        {
          name: 'Bưu cục Quận 3',
          address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
          phone: '028-2345678',
          workingHours: '8:00-17:00',
          area: 'Quận 3',
          status: 'active'
        },
        {
          name: 'Bưu cục Quận 7',
          address: '789 Nguyễn Thị Thập, Quận 7, TP.HCM',
          phone: '028-3456789',
          workingHours: '8:00-17:00',
          area: 'Quận 7',
          status: 'active'
        }
      ]);
      console.log('✅ Sample post offices added!');
    }

    const serviceTypeCount = await ServiceTypeModel.count();
    if (serviceTypeCount === 0) {
      console.log('🔄 Adding sample service types...');
      await ServiceTypeModel.bulkCreate([
        {
          name: 'Tiêu chuẩn',
          basePrice: 15000,
          codFee: 5000,
          weightLimit: 30.00,
          deliveryTime: '3-5 ngày',
          description: 'Dịch vụ giao hàng tiêu chuẩn',
          status: 'active'
        },
        {
          name: 'Nhanh',
          basePrice: 25000,
          codFee: 8000,
          weightLimit: 20.00,
          deliveryTime: '1-2 ngày',
          description: 'Dịch vụ giao hàng nhanh',
          status: 'active'
        },
        {
          name: 'Hỏa tốc',
          basePrice: 40000,
          codFee: 12000,
          weightLimit: 10.00,
          deliveryTime: 'Trong ngày',
          description: 'Dịch vụ giao hàng hỏa tốc',
          status: 'active'
        }
      ]);
      console.log('✅ Sample service types added!');
    }
    
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
};

// Run sync when this module is imported
syncDatabase();

const db = {
  sequelize,
  Sequelize,
  User: UserModel,
  OTP: OTPModel,
  PostOffice: PostOfficeModel,
  ServiceType: ServiceTypeModel,
  Order: OrderModel
};

export default db;




