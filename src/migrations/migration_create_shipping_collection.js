'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShippingCollections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Đơn hàng liên quan',
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shipperId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Shipper thu tiền',
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amountCollected: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Số tiền COD shipper thu từ khách',
      },
      discrepancy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Chênh lệch so với amountExpected',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ShippingCollections');
  }
};