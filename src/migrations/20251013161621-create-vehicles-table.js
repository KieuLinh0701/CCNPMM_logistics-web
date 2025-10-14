'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
        comment: 'Loại xe: Truck (xe tải) hoặc Van',
      },
      capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Tải trọng tối đa (kg)',
      },
      status: {
        type: Sequelize.ENUM('Available', 'InUse', 'Maintenance', 'Archived'),
        allowNull: false,
        defaultValue: 'Available',
        comment: 'Trạng thái xe',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Ghi chú thêm (nếu có)',
      },
      officeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Xe thuộc về chi nhánh nào',
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
    await queryInterface.dropTable('Vehicles');
  },
};