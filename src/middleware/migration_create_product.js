'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Người sở hữu / người bán sản phẩm',
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tên sản phẩm',
      },
      weight: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
        comment: 'Trọng lượng sản phẩm (kg)',
      },
      type: {
        type: Sequelize.ENUM('Fresh', 'Letter', 'Goods'),
        allowNull: false,
        comment: 'Loại hàng: Fresh, Letter, Goods',
      },
      status: {
        type: Sequelize.ENUM('Active','Inactive'),
        allowNull: false,
        defaultValue: 'Active',
        comment: 'Trạng thái sản phẩm',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};