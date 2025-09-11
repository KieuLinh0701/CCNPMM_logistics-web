import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // 1 Order có nhiều lịch sử vận chuyển
      Order.hasMany(models.OrderHistory, { foreignKey: 'orderId', as: 'histories' });

      // 1 Order thuộc về 1 dịch vụ giao hàng
      Order.belongsTo(models.ShippingService, { foreignKey: 'shippingServiceId', as: 'shippingService' });

      // 1 Order thuộc về 1 User (chủ cửa hàng)
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Order.init(
    {
      trackingCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'InTransit', 'Shipping', 'Delivered', 'Cancelled'),
        defaultValue: 'Pending',
      },

      // Người nhận
      recipientName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      recipientPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Địa chỉ người nhận
      cityCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      wardCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      detailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Khối lượng 
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      // Phí và thanh toán
      shippingFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalPrice: { // Gồm phí vận chuyển và có thể có giá trị đơn hàng
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payer: {
        type: DataTypes.ENUM('Customer', 'Shop'),
        allowNull: false,
        defaultValue: 'Customer',
      },
      paymentMethod: {
        type: DataTypes.ENUM('Cash', 'BankTransfer', 'VNPay', 'ZaloPay'),
        allowNull: false,
        defaultValue: 'Cash',
      },
      paymentStatus: {
        type: DataTypes.ENUM('Paid', 'Unpaid'),
        allowNull: false,
        defaultValue: 'Unpaid',
      },

      // Người tạo đơn (chủ cửa hàng)
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Ghi chú
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // Thời gian giao hàng
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true, 
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Order;
};