'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Vehicles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Xe được dùng để vận chuyển',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Người chịu trách nhiệm vận chuyển (shipper)',
      },
      status: {
        type: Sequelize.ENUM('Pending', 'InTransit', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: `
          - Pending: Đang chờ bắt đầu vận chuyển.
          - InTransit: Đang trong quá trình vận chuyển.
          - Completed: Đã hoàn thành vận chuyển.
          - Cancelled: Đã hủy chuyến vận chuyển.
        `,
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Thời điểm bắt đầu vận chuyển',
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Thời điểm kết thúc vận chuyển (phải >= startTime)',
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
    await queryInterface.dropTable('Shipments');
  },
};