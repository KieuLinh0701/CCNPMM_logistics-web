import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // Định nghĩa mối quan hệ
      Order.belongsTo(models.PostOffice, { foreignKey: 'postOfficeId', as: 'postOffice' });
      Order.belongsTo(models.ServiceType, { foreignKey: 'serviceTypeId', as: 'serviceType' });
    }
  }

  Order.init(
    {
      trackingNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã vận đơn'
      },
      senderName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên người gửi'
      },
      senderPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'SĐT người gửi'
      },
      senderAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Địa chỉ người gửi'
      },
      receiverName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên người nhận'
      },
      receiverPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'SĐT người nhận'
      },
      receiverAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Địa chỉ người nhận'
      },
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        comment: 'Trọng lượng (kg)'
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Giá cơ bản'
      },
      codAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Số tiền COD'
      },
      codFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Phí COD'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Tổng tiền'
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        comment: 'Trạng thái đơn hàng'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú'
      },
      postOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID bưu cục'
      },
      serviceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID loại dịch vụ'
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
    }
  );

  return Order;
};
