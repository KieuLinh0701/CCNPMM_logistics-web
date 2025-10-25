import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class TransactionImage extends Model {
        static associate(models) {
            TransactionImage.belongsTo(models.Transaction, { 
                foreignKey: 'transactionId',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    }

    TransactionImage.init({
        transactionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Transactions',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'TransactionImage',
        tableName: 'TransactionImages',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    });

    return TransactionImage;
};