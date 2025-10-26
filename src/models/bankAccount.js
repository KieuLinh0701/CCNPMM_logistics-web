import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class BankAccount extends Model {
    static associate(models) {
      // 1 user có nhiều tài khoản ngân hàng
      BankAccount.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  BankAccount.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của user',
      },
      bankName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên ngân hàng',
      },
      accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Số tài khoản',
      },
      accountName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên chủ tài khoản',
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Có phải tài khoản mặc định không',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú thêm',
      },
    },
    {
      sequelize,
      modelName: 'BankAccount',
      tableName: 'BankAccounts',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return BankAccount;
};