'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShippingRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      serviceTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ServiceTypes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      regionType: {
        type: Sequelize.ENUM('Intra-city', 'Intra-region', 'Near-region', 'Inter-region'),
        allowNull: false,
      },
      weightFrom: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      weightTo: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      unit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.5,
      },
      extraPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Extra price per unit weight above weightFrom, used if weightTo is null',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ShippingRates');
  },
};