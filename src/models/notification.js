import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      // Notification.belongsTo(models.Office, {
      //   foreignKey: "officeId",
      //   as: "office",
      // });
    }
  }

  Notification.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.STRING,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      relatedId: {
        type: DataTypes.BIGINT,
      },
      relatedType: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // officeId: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   references: { model: 'Offices', key: 'id' },
      // },
      // targetRole: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "Notifications",
    }
  );

  return Notification;
};