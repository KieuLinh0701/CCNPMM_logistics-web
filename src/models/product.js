import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // Liên kết nhiều-một với User (người bán)
      Product.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Liên kết nhiều-nhiều với Order thông qua OrderProduct
      Product.belongsToMany(models.Order, {
        through: models.OrderProduct,
        foreignKey: 'productId',
        as: 'orders',
      });
    }
  }

  Product.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Người sở hữu / người bán sản phẩm'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên sản phẩm'
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Trọng lượng sản phẩm (kg)'
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Giá sản phẩm'
      },
      type: {
        type: DataTypes.ENUM('Fresh', 'Letter', 'Goods'),
        allowNull: false,
        comment: 'Loại hàng: Fresh, Letter, Goods'
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
        comment: 'Trạng thái sản phẩm'
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Số lượng hàng trong kho'
      },
      soldQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Số lượng đã bán thành công'
      }
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'Products',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      indexes: [
        {
          unique: true,
          fields: ['userId', 'name'],
          name: 'unique_product_per_user'
        }
      ]
    }
  );

  return Product;
};