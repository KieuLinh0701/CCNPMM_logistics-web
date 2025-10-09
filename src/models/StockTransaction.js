import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class StockTransaction extends Model {
        static associate(models) {
            // Liên kết với Product
            StockTransaction.belongsTo(models.Product, {
                foreignKey: 'productId',
                as: 'product',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });

            // Liên kết với Order (nếu có)
            StockTransaction.belongsTo(models.Order, {
                foreignKey: 'orderId',
                as: 'order',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            });
        }
    }

    StockTransaction.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'ID sản phẩm'
            },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'ID đơn hàng (nếu có)'
            },
            type: {
                type: DataTypes.ENUM('Import', 'Export', 'Adjustment', 'Return'),
                allowNull: false,
                comment: 'Loại giao dịch: NHẬP, XUẤT, ĐIỀU CHỈNH, TRẢ HÀNG'
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'Số lượng thay đổi'
            },
            previousStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'Tồn kho trước khi thay đổi'
            },
            newStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'Tồn kho sau khi thay đổi'
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Ghi chú giao dịch'
            },
        },
        {
            sequelize,
            modelName: 'StockTransaction',
            tableName: 'StockTransactions',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    return StockTransaction;
};