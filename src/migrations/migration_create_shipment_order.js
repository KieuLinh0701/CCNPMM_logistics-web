'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShipmentOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Shipments', // bảng Shipment phải tồn tại trước
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders', // bảng Order phải tồn tại trước
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Tạo index unique cho cặp shipmentId + orderId
    await queryInterface.addConstraint('ShipmentOrders', {
      fields: ['shipmentId', 'orderId'],
      type: 'unique',
      name: 'shipment_order_unique_constraint',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ShipmentOrders');
  },
};