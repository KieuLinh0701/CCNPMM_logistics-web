import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Shipment extends Model {
    static associate(models) {
      Shipment.hasMany(models.ShipmentOrder, { 
        foreignKey: 'shipmentId', 
        as: 'shipmentOrders',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      Shipment.belongsTo(models.Vehicle, { 
        foreignKey: 'vehicleId', 
        as: 'vehicle',
        onDelete: 'SET NULL', 
        onUpdate: 'CASCADE'
      });

      Shipment.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user',
        onDelete: 'SET NULL', 
        onUpdate: 'CASCADE'
      });
    }
  }

  Shipment.init(
    {
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
        validate: {
          isAfterStart(value) {
            if (value && this.startTime && value < this.startTime) {
              throw new Error('endTime must be after startTime');
            }
          }
        }
      },
    },
    {
      sequelize,
      modelName: 'Shipment',
      tableName: 'Shipments',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Shipment;
};
