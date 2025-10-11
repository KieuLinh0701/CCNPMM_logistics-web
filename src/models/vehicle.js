import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Vehicle extends Model {
    static associate(models) {
      // 1 Vehicle có thể có nhiều Shipment
      Vehicle.hasMany(models.Shipment, {
        foreignKey: 'vehicleId',
        as: 'shipments',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // 1 Vehicle thuộc về 1 Office
      Vehicle.belongsTo(models.Office, {
        foreignKey: 'officeId',
        as: 'office',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Vehicle.init(
    {
      licensePlate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Biển số xe',
      },
      type: {
        type: DataTypes.ENUM('Truck', 'Van'),
        allowNull: false,
        defaultValue: 'Truck',
        comment: 'Loại xe',
      },
      capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Tải trọng tối đa (kg)',
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM('Available', 'InUse', 'Maintenance', 'Archived'),
        allowNull: false,
        defaultValue: 'Available',
        comment: 'Trạng thái xe',
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Ghi chú thêm (nếu có)',
      },
      officeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Xe thuộc về chi nhánh nào',
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'Vehicles',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Vehicle;
};