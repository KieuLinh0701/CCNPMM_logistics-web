import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Region extends Model {
    static associate(models) {
      // Ví dụ: Region.hasMany(models.Office, { foreignKey: 'regionId', as: 'offices' });
    }
  }

  Region.init(
    {
      codeCity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Mã thành phố',
      },
      regionName: {
        type: DataTypes.ENUM('North', 'Central', 'South'),
        allowNull: false,
        comment: 'Tên vùng: Bắc, Trung, Nam',
      },
    },
    {
      sequelize,
      modelName: 'Region',
      tableName: 'Regions',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      comment: 'Bảng phân chia vùng miền theo mã thành phố',
    }
  );

  return Region;
};