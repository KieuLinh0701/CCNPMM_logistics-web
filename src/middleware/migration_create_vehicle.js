'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      licensePlate: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Biển số xe',
      },
      type: {
        type: Sequelize.ENUM('Truck', 'Van'),
        allowNull: false,
        defaultValue: 'Truck',
        comment: 'Loại xe',
      },
      capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Tải trọng tối đa (kg)',
      },
      status: {
        type: Sequelize.ENUM('Available', 'InUse', 'Maintenance'),
        allowNull: false,
        defaultValue: 'Available',
        comment: 'Trạng thái xe',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Ghi chú thêm (nếu có)',
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

  async down(queryInterface) {
    await queryInterface.dropTable('Vehicles');
  },
};