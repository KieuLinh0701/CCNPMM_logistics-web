'use strict';

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
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Trọng lượng sản phẩm (kg)',
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Giá sản phẩm',
      },
      type: {
        type: Sequelize.ENUM('Fresh', 'Letter', 'Goods'),
        allowNull: false,
        comment: 'Loại hàng: Fresh, Letter, Goods',
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
        comment: 'Trạng thái sản phẩm',
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng hàng trong kho',
      },
      soldQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng đã bán thành công',
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

    // Tạo unique constraint (mỗi user chỉ có 1 sản phẩm trùng tên)
    await queryInterface.addConstraint('Products', {
      fields: ['userId', 'name'],
      type: 'unique',
      name: 'unique_product_per_user',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  },
};