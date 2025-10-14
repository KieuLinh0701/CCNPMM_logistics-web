'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderHistories', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      fromOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Offices', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      toOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Offices', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Shipments', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      action: {
        type: Sequelize.ENUM(
          'ReadyForPickup',
          'PickedUp',
          'Imported',
          'Exported',
          'Shipping',
          'Delivered',
          'Returned'
        ),
        allowNull: false,
        comment: 'Action type representing the shipping step',
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderHistories');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_OrderHistories_action";'
    );
  },
};