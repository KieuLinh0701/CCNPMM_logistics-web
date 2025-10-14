'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShippingRequests', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Orders', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      officeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Offices', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      requestType: {
        type: Sequelize.ENUM('Complaint', 'DeliveryReminder', 'ChangeOrderInfo', 'Inquiry'),
        allowNull: false,
      },
      requestContent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Processing', 'Resolved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contactName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contactEmail: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      contactPhoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      contactCityCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      contactWardCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      contactDetailAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa bảng và các ENUM liên quan
    await queryInterface.dropTable('ShippingRequests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ShippingRequests_requestType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ShippingRequests_status";');
  },
};