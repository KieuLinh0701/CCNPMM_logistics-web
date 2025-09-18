import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShipmentOrder extends Model {
    static associate(models) {
      ShipmentOrder.belongsTo(models.Shipment, { 
        foreignKey: 'shipmentId', 
        as: 'shipment',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      ShipmentOrder.belongsTo(models.Order, { 
        foreignKey: 'orderId', 
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ShipmentOrder.init(
    {
      shipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ShipmentOrder',
      tableName: 'ShipmentOrders',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['shipmentId', 'orderId'], 
        },
      ],
    }
  );

  return ShipmentOrder;
};