import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Region extends Model {
    static associate(models) {
    }
  }

  Region.init(
    {
      codeCity: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      regionName: {
        type: DataTypes.ENUM('North', 'Central', 'South'),
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'Region',
    }
  );

  return Region;
};