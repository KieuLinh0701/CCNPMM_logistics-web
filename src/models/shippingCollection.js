// Bảng này lưu số tiền cod shipper nhận từ khách hàng để đối chiếu thất thoát
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShippingCollection extends Model {
    static associate(models) {
      ShippingCollection.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      ShippingCollection.belongsTo(models.User, { // Shipper
        foreignKey: 'shipperId',
        as: 'shipper',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ShippingCollection.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Đơn hàng liên quan'
      },
      shipperId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Shipper thu tiền'
      },
      amountCollected: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Số tiền COD shipper thu từ khách'
      },
      discrepancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Chênh lệch so với amountExpected'
       },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'ShippingCollection',
      tableName: 'ShippingCollections',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return ShippingCollection;
};