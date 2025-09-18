// models/OrderProduct.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class OrderProduct extends Model {
    static associate(models) {
      OrderProduct.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderProduct.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  OrderProduct.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OrderProduct',
      tableName: 'OrderProducts',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return OrderProduct;
};