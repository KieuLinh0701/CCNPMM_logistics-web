'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceTypes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Tên dịch vụ (VD: Tiêu chuẩn, Nhanh, Hỏa tốc)',
      },
      deliveryTime: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Thời gian giao hàng (VD: "1-2 ngày", "Trong ngày")',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Trạng thái hoạt động của loại dịch vụ',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ServiceTypes');
  },
};