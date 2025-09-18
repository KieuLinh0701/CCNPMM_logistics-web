'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Promotions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã khuyến mãi',
    },
    description: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Mô tả ngắn về chương trình',
    },
    discountType: {
      type: Sequelize.ENUM('percentage', 'fixed'),
      allowNull: false,
      defaultValue: 'percentage',
      comment: 'Loại giảm giá: phần trăm hoặc số tiền cố định',
    },
    discountValue: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Giá trị giảm (VD: 10 = 10%, hoặc 5000đ)',
    },
    minOrderValue: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Giá trị đơn tối thiểu để áp dụng',
    },
    maxDiscountAmount: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Giảm tối đa (chỉ áp dụng khi discountType = percentage)',
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    usageLimit: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Số lần sử dụng tối đa, null = không giới hạn',
    },
    usedCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Số lần đã sử dụng',
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive', 'expired'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Trạng thái chương trình khuyến mãi',
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
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Promotions');
}