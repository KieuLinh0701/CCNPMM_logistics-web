import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ServiceType extends Model {
    static associate(models) {
      // Định nghĩa mối quan hệ sau này
      ServiceType.hasMany(models.Order, { foreignKey: 'serviceTypeId', as: 'orders' });
    }
  }

  ServiceType.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'VD: Tiêu chuẩn, Nhanh, Hỏa tốc'
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Giá cơ bản'
      },
      codFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Phí COD'
      },
      weightLimit: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        comment: 'Giới hạn trọng lượng (kg)'
      },
      deliveryTime: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'VD: "1-2 ngày", "3-5 ngày"'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'ServiceType',
      tableName: 'servicetypes',
    }
  );

  return ServiceType;
};
