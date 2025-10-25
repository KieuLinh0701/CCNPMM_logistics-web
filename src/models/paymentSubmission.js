import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class PaymentSubmission extends Model {
    static associate(models) {
      PaymentSubmission.belongsTo(models.Office, {
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      PaymentSubmission.belongsTo(models.User, { 
        foreignKey: 'submittedById',
        as: 'submittedBy',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      PaymentSubmission.belongsTo(models.User, { 
        foreignKey: 'confirmedById',
        as: 'confirmedBy',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  PaymentSubmission.init({
    officeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submittedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Shipper nộp trực tiếp'
    },
    totalAmountSubmitted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tổng tiền nộp từ shipper',
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Adjusted', 'Rejected'),
      defaultValue: 'Pending',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reconciledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Thời điểm kho/bưu cục xác nhận',
    },
    confirmedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    orderIds: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Danh sách ID đơn hàng trong lô tiền nộp',
    },
  }, {
    sequelize,
    modelName: 'PaymentSubmission',
    tableName: 'PaymentSubmissions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  return PaymentSubmission;
};