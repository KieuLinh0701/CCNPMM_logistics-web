// Sản phẩm của user và có thể đưa vào order

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Định nghĩa mối quan hệ sau này
      User.hasOne(models.Employee, { foreignKey: 'userId', as: 'employee' })

      User.hasMany(models.Product, {
        foreignKey: 'userId',
        as: 'products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      detailAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codeWard: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      codeCity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'driver', 'shipper', 'user'),
        defaultValue: 'user',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
      },
      images: {  
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Lưu ảnh C:/uploads',
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};




