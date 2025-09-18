// Đây là bảng đối soát số tiền cod tính trên hệ thống và số tiền shipper nộp cho bưu cục
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class PaymentSubmission extends Model {
    static associate(models) {
      PaymentSubmission.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      PaymentSubmission.belongsTo(models.Office, { // Kho/bưu cục
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      PaymentSubmission.belongsTo(models.User, { // Shipper nộp tiền
        foreignKey: 'shipperId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  PaymentSubmission.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      officeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipperId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amountSubmitted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Số tiền thực tế kho/bưu cục nhận từ shipper'
      },
      discrepancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Chênh lệch so với amountCollected'
      },
      status: {
        type: DataTypes.ENUM('Pending','Confirmed','Adjusted','Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: `
            Trạng thái đối soát tiền COD:
            - Pending: Chờ kho/bưu cục xác nhận số tiền nộp từ shipper.
            - Confirmed: Kho/bưu cục xác nhận số tiền nộp đúng với amountCollected (khớp hệ thống).
            - Adjusted: Kho/bưu cục xác nhận nhưng có điều chỉnh (ví dụ: thu thiếu hoặc thừa đã giải thích/điều chỉnh).
            - Rejected: Kho/bưu cục từ chối số tiền nộp do sai lệch lớn, cần kiểm tra hoặc xử lý thủ công.
            },
             `
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reconciledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: `
            Thời điểm kho/bưu cục xác nhận số tiền nộp từ shipper.
            - Khi bản ghi mới được tạo (shipper nộp tiền), status = Pending.
            - Khi kho/bưu cục kiểm tra và cập nhật status (Confirmed / Adjusted / Rejected),
            thời điểm đó sẽ được ghi vào reconciledAt.
            - Giúp phân biệt với createdAt, vì shipper nộp và kho xác nhận có thể khác thời điểm.
        `
      }
    },
    {
      sequelize,
      modelName: 'PaymentSubmission',
      tableName: 'PaymentSubmissions',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return PaymentSubmission;
};