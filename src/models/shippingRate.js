import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShippingRate extends Model {
    static associate(models) {
      // 1 ShippingRate thuộc về 1 ShippingService
      ShippingRate.belongsTo(models.ServiceType, { foreignKey: 'serviceTypeId', as: 'serviceType' });
    }
  }

  ShippingRate.init(
    {
      serviceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      regionType: {
        type: DataTypes.ENUM('Intra-city', 'Intra-region', 'Near-region', 'Inter-region'),
        allowNull: false,
      },
      weightFrom: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      weightTo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, 
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      unit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.5,
        allowNull: true,
      },
      extraPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Extra price per unit weight above weightFrom, used if weightTo is null',
      },
    },
    {
      sequelize,
      modelName: 'ShippingRate',
      timestamps: true,
    }
  );

  return ShippingRate;
};
