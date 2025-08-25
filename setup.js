import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  try {
    // Connect to MySQL server (without specifying database)
    const sequelize = new Sequelize('mysql', 'root', null, {
      host: 'localhost',
      dialect: 'mysql',
      logging: false,
    });

    // Create database if it doesn't exist
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS logistic_system;`);
    console.log('✅ Database created successfully');

    // Close connection
    await sequelize.close();

    console.log('🎉 Database setup completed!');
    console.log('📝 Next steps:');
    console.log('1. Run: npx sequelize-cli db:migrate');
    console.log('2. Run: npm start');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('💡 Make sure MySQL is running and accessible');
  }
};

setupDatabase();




