import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class PostOffice extends Model {
    static associate(models) {
      // Định nghĩa mối quan hệ sau này
      PostOffice.hasMany(models.Order, { foreignKey: 'postOfficeId', as: 'orders' });
    }
  }

  PostOffice.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên bưu cục'
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Địa chỉ bưu cục'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Số điện thoại'
      },
      workingHours: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Giờ làm việc'
      },
      area: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Khu vực'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'PostOffice',
      tableName: 'postoffices',
    }
  );

  return PostOffice;
};
