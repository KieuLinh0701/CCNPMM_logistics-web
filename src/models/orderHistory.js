import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class OrderHistory extends Model {
    static associate(models) {
      // 1 lịch sử thuộc về 1 Order
      OrderHistory.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      // Lịch sử có thể tham chiếu tới kho nguồn và kho đích
      OrderHistory.belongsTo(models.Office, { foreignKey: 'fromOfficeId', as: 'fromOffice' });
      OrderHistory.belongsTo(models.Office, { foreignKey: 'toOfficeId', as: 'toOffice' });
      // ịch sử đơn có thể gắn với 1 chuyến xe (Shipment)
      OrderHistory.belongsTo(models.Shipment, { foreignKey: 'shipmentId', as: 'shipment' });
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
      action: {
        type: DataTypes.ENUM(
          'ReadyForPickup',   // Người gửi chuẩn bị hàng xong
          'PickedUp',         // Shipper tới cửa hàng lấy hàng
          'Imported',         // Nhập kho
          'Exported',         // Xuất kho
          'Shipping',         // Đang đi giao
          'Delivered',        // Đã giao thành công
          'Returned'          // Đơn hàng hoàn về
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
      },
    },
    {
      sequelize,
      modelName: 'OrderHistory',
      timestamps: false, 
    }
  );

  return OrderHistory;
};