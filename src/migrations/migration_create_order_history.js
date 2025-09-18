'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fromOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Offices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      toOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Offices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shipmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Shipments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actionTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderHistories');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OrderHistories_action";');
  },
};