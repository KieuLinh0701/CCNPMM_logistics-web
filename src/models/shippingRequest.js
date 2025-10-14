// models/ShippingRequest.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ShippingRequest extends Model {
    static associate(models) {
      // Quan hệ tới Order
      ShippingRequest.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Quan hệ tới Office
      ShippingRequest.belongsTo(models.Office, {
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // Quan hệ tới User (người tạo nếu có tài khoản)
      ShippingRequest.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
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
        comment: 'Liên kết tới đơn hàng (nếu có)',
      },

      officeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Bưu cục/Đơn vị vận chuyển xử lý yêu cầu',
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID người tạo yêu cầu (nếu có tài khoản)',
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

      // Thông tin liên hệ khi người dùng không có tài khoản
      contactName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Tên người liên hệ nếu không có tài khoản',
      },
      contactEmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Email người liên hệ nếu không có tài khoản',
      },
      contactPhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Số điện thoại người liên hệ nếu không có tài khoản',
      },
      contactCityCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Mã thành phố người liên hệ',
      },
      contactWardCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Mã phường/quận người liên hệ',
      },
      contactDetailAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Địa chỉ chi tiết người liên hệ',
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