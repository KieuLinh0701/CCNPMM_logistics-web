import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ServiceType extends Model {
    static associate(models) {
      // 1 dịch vụ có nhiều ShippingRates
      ServiceType.hasMany(models.ShippingRate, {
        foreignKey: 'serviceTypeId',
        as: 'rates',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ServiceType.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Tên dịch vụ (VD: Tiêu chuẩn, Nhanh, Hỏa tốc)',
      },
      deliveryTime: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Thời gian giao hàng (VD: "1-2 ngày", "Trong ngày")',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Trạng thái hoạt động của loại dịch vụ',
      },
    },
    {
      sequelize,
      modelName: 'ServiceType',
      tableName: 'ServiceTypes',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      comment: 'Bảng lưu thông tin các loại dịch vụ vận chuyển',
    }
  );

  return ServiceType;
};