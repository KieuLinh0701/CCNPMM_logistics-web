import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Feedback extends Model {
    static associate(models) {
      // Một feedback thuộc về một đơn hàng
      Feedback.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Một feedback được tạo bởi một user
      Feedback.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  Feedback.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID đơn hàng được đánh giá',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID người đánh giá',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
        comment: 'Điểm đánh giá từ 1-5 sao',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Nhận xét chi tiết',
      },
      serviceRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
        comment: 'Đánh giá chất lượng dịch vụ 1-5 sao',
      },
      deliveryRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
        comment: 'Đánh giá thái độ nhân viên giao hàng 1-5 sao',
      },
      isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Đánh giá ẩn danh',
      },
    },
    {
      sequelize,
      modelName: 'Feedback',
      tableName: 'Feedbacks',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Feedback;
};

