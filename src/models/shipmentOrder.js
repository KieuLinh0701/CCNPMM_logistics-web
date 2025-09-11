import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShipmentOrder extends Model {
    static associate(models) {
      // 1 ShipmentOrder thuộc về 1 Shipment
      ShipmentOrder.belongsTo(models.Shipment, { foreignKey: 'shipmentId', as: 'shipment' });

      // 1 ShipmentOrder thuộc về 1 Order
      ShipmentOrder.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
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
      timestamps: false, 
    }
  );

  return ShipmentOrder;
};