import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShippingService extends Model {
    static associate(models) {
      // 1 dịch vụ có nhiều ShippingRates
      ShippingService.hasMany(models.ShippingRate, { foreignKey: 'serviceId', as: 'rates' });
    }
  }

  ShippingService.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'ShippingService',
    }
  );

  return ShippingService;
};