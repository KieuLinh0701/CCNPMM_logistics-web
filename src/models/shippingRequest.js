import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShippingRequest extends Model {
    static associate(models) {
      // 1 yêu cầu thuộc về 1 đơn hàng
      ShippingRequest.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Nếu bạn có bảng Carrier/Office riêng cho đơn vị vận chuyển có thể liên kết thêm
      ShippingRequest.belongsTo(models.Office, {
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  ShippingRequest.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Liên kết tới đơn hàng',
      },

      officeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Bưu cục/Đơn vị vận chuyển xử lý yêu cầu',
      },

      requestType: {
        type: DataTypes.ENUM('Complaint', 'DeliveryReminder', 'ChangeOrderInfo', 'Inquiry'),
        allowNull: false,
        comment: 'Loại yêu cầu: Khiếu nại, hối giao hàng, đổi thông tin, tư vấn',
      },

      requestContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Nội dung yêu cầu chi tiết',
      },

      status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Resolved', 'Rejected', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'Trạng thái xử lý yêu cầu',
      },

      response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Phản hồi từ đơn vị vận chuyển (nếu có)',
      },
    },
    {
      sequelize,
      modelName: 'ShippingRequest',
      tableName: 'ShippingRequests',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return ShippingRequest;
};