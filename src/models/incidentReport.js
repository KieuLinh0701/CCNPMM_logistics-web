// Bảng lưu trữ báo cáo sự cố từ shipper
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class IncidentReport extends Model {
    static associate(models) {
      IncidentReport.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      IncidentReport.belongsTo(models.User, { // Shipper báo cáo
        foreignKey: 'shipperId',
        as: 'shipper',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      IncidentReport.belongsTo(models.User, { // Admin/Manager xử lý
        foreignKey: 'handledBy',
        as: 'handler',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  IncidentReport.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Đơn hàng liên quan đến sự cố'
      },
      shipperId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Shipper báo cáo sự cố'
      },
      incidentType: {
        type: DataTypes.ENUM(
          'recipient_not_available',
          'wrong_address', 
          'package_damaged',
          'recipient_refused',
          'security_issue',
          'other'
        ),
        allowNull: false,
        comment: 'Loại sự cố'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Tiêu đề báo cáo'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Mô tả chi tiết sự cố'
      },
      location: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Địa điểm xảy ra sự cố'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Mức độ ưu tiên'
      },
      recipientName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Tên người nhận'
      },
      recipientPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Số điện thoại người nhận'
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Danh sách URL hình ảnh'
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'resolved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Trạng thái xử lý'
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Giải pháp xử lý'
      },
      handledBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Người xử lý báo cáo'
      },
      handledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời điểm xử lý'
      }
    },
    {
      sequelize,
      modelName: 'IncidentReport',
      tableName: 'IncidentReports',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return IncidentReport;
};

