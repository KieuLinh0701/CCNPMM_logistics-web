import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Promotion extends Model {
    static associate(models) {
      // 1 Promotion có thể áp dụng cho nhiều đơn hàng
      Promotion.hasMany(models.Order, {
        foreignKey: 'promotionId',
        as: 'orders',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Promotion.init(
    {
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã khuyến mãi',
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Mô tả ngắn về chương trình',
      },
      discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage',
        comment: 'Loại giảm giá: phần trăm hoặc số tiền cố định',
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Giá trị giảm (VD: 10 = 10%, hoặc 5000đ)',
        validate: {
          min: 0,
        },
      },
      minOrderValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Giá trị đơn tối thiểu để áp dụng',
      },
      maxDiscountAmount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Giảm tối đa (chỉ áp dụng khi discountType = percentage)',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Số lần sử dụng tối đa, null = không giới hạn',
      },
      usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lần đã sử dụng',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'expired'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Trạng thái chương trình khuyến mãi',
      },
    },
    {
      sequelize,
      modelName: 'Promotion',
      tableName: 'Promotions',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Promotion;
};