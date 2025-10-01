import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class OrderHistory extends Model {
    static associate(models) {
      OrderHistory.belongsTo(models.Order, { 
        foreignKey: 'orderId', 
        as: 'order',
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
      });

      OrderHistory.belongsTo(models.Office, { 
        foreignKey: 'fromOfficeId', 
        as: 'fromOffice',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      OrderHistory.belongsTo(models.Office, { 
        foreignKey: 'toOfficeId', 
        as: 'toOffice',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      OrderHistory.belongsTo(models.Shipment, { 
        foreignKey: 'shipmentId', 
        as: 'shipment',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }

  OrderHistory.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fromOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      toOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      shipmentId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
      },
      status: {
        type: DataTypes.ENUM(
          'ReadyForPickup',
          'PickedUp',
          'Imported',
          'Exported',
          'Shipping',
          'Delivered',
          'Returned'
        ),
        allowNull: false,
        comment: 'Action type representing the shipping step'
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      actionTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isBeforeNow(value) {
            if (new Date(value) > new Date()) {
              throw new Error('actionTime cannot be in the future');
            }
          }
        }
      },
    },
    {
      sequelize,
      modelName: 'OrderHistory',
      tableName: 'OrderHistories', 
      timestamps: false,
    }
  );

  return OrderHistory;
};