import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Employee extends Model {
    static associate(models) {
      // Mỗi nhân viên liên kết với 1 User
      Employee.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Mỗi nhân viên thuộc về 1 Office
      Employee.belongsTo(models.Office, { foreignKey: 'officeId', as: 'office' });
    }
  }

  Employee.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      officeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      hireDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      shift: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening', 'Full Day'),
        defaultValue: 'Full Day',
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Leave'),
        defaultValue: 'Inactive',
      },
    },
    {
      sequelize,
      modelName: 'Employee',
      tableName: 'Employees',
      timestamps: true,
    }
  );

  return Employee;
};