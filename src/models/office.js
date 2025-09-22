import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Office extends Model {
    static associate(models) {
      // 1 Office có nhiều Employee
      Office.hasMany(models.Employee, { foreignKey: 'officeId', as: 'employees' });
    }
  }

  Office.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codeWard: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      codeCity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      latitude : {
        type: DataTypes.DECIMAL(12,7),
        allowNull: false,
      },
      longitude  : {
        type: DataTypes.DECIMAL(12,7),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      openingTime: {
        type: DataTypes.TIME,
        defaultValue: '07:00:00',
      },
      closingTime: {
        type: DataTypes.TIME,
        defaultValue: '17:00:00',
      },
      type: {
        type: DataTypes.ENUM('Head Office', 'Post Office'),
        defaultValue: 'Post Office',
      },
      status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Maintenance'),
        defaultValue: 'Active',
      },
    },
    {
      sequelize,
      modelName: 'Office',
      timestamps: true,
    }
  );

  return Office;
};