import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Shipment extends Model {
    static associate(models) {
      // Shipment có nhiều đơn hàng (thông qua ShipmentOrder)
      Shipment.hasMany(models.ShipmentOrder, { foreignKey: 'shipmentId', as: 'orders' });

      // Shipment gắn với 1 xe
      Shipment.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

      // Shipment gắn với 1 tài xế
      Shipment.belongsTo(models.Driver, { foreignKey: 'driverId', as: 'driver' });
    }
  }

  Shipment.init(
    {
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'InTransit', 'Completed', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Shipment',
      timestamps: true, // có createdAt, updatedAt
    }
  );

  return Shipment;
};