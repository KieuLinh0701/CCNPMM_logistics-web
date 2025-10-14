'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShipmentOrders', {
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Shipments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('ShipmentOrders', {
      fields: ['shipmentId', 'orderId'],
      type: 'unique',
      name: 'unique_shipment_order'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ShipmentOrders');
  },
};