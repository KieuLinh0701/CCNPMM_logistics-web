import { Model, DataTypes } from 'sequelize';
import transactionImage from './transactionImage';

export default (sequelize) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      Transaction.belongsTo(models.Office, {
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      Transaction.belongsTo(models.PaymentSubmission, {
        foreignKey: 'paymentSubmissionId',
        as: 'paymentSubmission',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      Transaction.hasMany(models.TransactionImage, {
        as: 'images',
        foreignKey: 'transactionId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Transaction.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    officeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentSubmissionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Income', 'Expense'),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM('Cash', 'VNPay'),
      allowNull: false,
      comment: 'phân loại nguồn tiền',
    },
    purpose: {
      type: DataTypes.ENUM(
        'Refund',          // 1. Hoàn tiền cho khách hàng
        'CODReturn',       // 2. Trả tiền COD về cho shop
        'ShippingService', // 3. Thanh toán phí dịch vụ vận chuyển
        'OfficeExpense',   // 4. Chi phí xe cộ / hoạt động nội bộ của văn phòng
        'RevenueTransfer'  // 5. Chuyển tiền doanh thu lên tổng hệ thống
      ),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
      comment: 'Trạng thái xác nhận giao dịch'
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Thời điểm giao dịch được xác nhận',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  return Transaction;
};