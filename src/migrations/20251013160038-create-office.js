'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Offices', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    codeWard: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    codeCity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    latitude: {
      type: Sequelize.DECIMAL(12, 7),
      allowNull: false,
    },
    longitude: {
      type: Sequelize.DECIMAL(12, 7),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    openingTime: {
      type: Sequelize.TIME,
      defaultValue: '07:00:00',
    },
    closingTime: {
      type: Sequelize.TIME,
      defaultValue: '17:00:00',
    },
    type: {
      type: Sequelize.ENUM('Head Office', 'Post Office'),
      defaultValue: 'Post Office',
    },
    status: {
      type: Sequelize.ENUM('Active', 'Inactive', 'Maintenance'),
      defaultValue: 'Active',
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Offices');
}
