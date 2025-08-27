import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class OTP extends Model {
    static associate(models) {
      // định nghĩa mối quan hệ sau này nếu cần
    }
  }

  OTP.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('register', 'reset'),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'OTP',
    }
  );

  return OTP;
};




