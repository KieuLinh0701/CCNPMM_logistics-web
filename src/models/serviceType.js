import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ServiceType extends Model {
    static associate(models) {
      // 1 dịch vụ có nhiều ShippingRates
      ServiceType.hasMany(models.ShippingRate, { foreignKey: 'serviceTypeId', as: 'rates' });
    }
  }

  ServiceType.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'VD: Tiêu chuẩn, Nhanh, Hỏa tốc',
      },
      deliveryTime: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'VD: "1-2 ngày", "Trong ngày"',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'ServiceType',
    }
  );

  return ServiceType;
};