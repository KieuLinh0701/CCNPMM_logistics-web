// migrations/20230915000000-create-servicetype.js
'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceTypes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'VD: Tiêu chuẩn, Nhanh, Hỏa tốc',
      },
      deliveryTime: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'VD: "1-2 ngày", "Trong ngày"',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ServiceTypes');
  },
};