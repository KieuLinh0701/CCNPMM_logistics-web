import db from '../models';
import paymentSubmission from '../models/paymentSubmission';

const { Op, fn, col, literal } = require("sequelize");

async function createUserTransaction(orderId, userId, totalFee, method, trackingNumber, transaction) {
    await db.Transaction.create({
        orderId: orderId,
        userId: userId,
        amount: totalFee,
        type: 'Expense',
        purpose: 'ShippingService',
        method: method,
        confirmedAt: new Date(),
        notes: `Trả phí ship cho đơn hàng #${trackingNumber}`,
    }, { transaction });
    return transaction;
}

async function createRefundUserTransaction(orderId, userId, totalFee, method, trackingNumber, transaction) {
    await db.Transaction.create({
        orderId: orderId,
        userId: userId,
        amount: totalFee,
        type: 'Income',
        purpose: 'Refund',
        method: method,
        confirmedAt: new Date(),
        notes: `Hoàn trả tiền ship cho đơn hàng #${trackingNumber}`,
    }, { transaction });
    return transaction;
}

async function createManagerShipTransaction(orderId, officeId, totalFee, method, trackingNumber, transaction) {
    await db.Transaction.create({
        orderId: orderId,
        officeId: officeId,
        amount: totalFee,
        type: 'Income',
        purpose: 'ShippingService',
        method: method,
        confirmedAt: new Date(),
        notes: `Thu phí ship cho đơn hàng #${trackingNumber}`,
    }, { transaction });
    return transaction;
}

const transactionService = {
    async getTransactionTypes(userId) {
        try {
            const user = await db.User.count({
                where: { id: userId },
            });

            if (!user) {
                return { success: false, message: 'Người dùng không tồn tại' };
            }

            const typesEnum = db.Transaction.rawAttributes.type.values;

            return {
                success: true,
                message: 'Lấy danh sách loại giao dịch  thành công',
                types: typesEnum,
            };
        } catch (error) {
            console.error('Get Types Enum error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async listUserTransactions(userId, page, limit, filters) {
        try {
            const { Op, fn, col, literal } = db.Sequelize;

            // Kiểm tra user
            const user = await db.User.findOne({ where: { id: userId } });
            if (!user) return { success: false, message: 'Người dùng không tồn tại' };

            let whereCondition = { userId };

            // Lọc dữ liệu
            const { searchText, type, startDate, endDate, sort } = filters || {};

            if (searchText && searchText.trim()) {
                const keyword = `%${searchText.trim()}%`;

                whereCondition[Op.or] = [
                    { id: { [Op.like]: keyword } },
                    { paymentSubmissionId: { [Op.like]: keyword } },
                    { '$order.trackingNumber$': { [Op.like]: keyword } },
                ];
            }

            if (type && type !== 'All') whereCondition.type = type;

            if (startDate && endDate) {
                whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
            }

            let order = [['confirmedAt', 'DESC']];

            if (sort && sort !== 'none') {
                switch (sort) {
                    case 'newest':
                        order = [['confirmedAt', 'DESC']];
                        break;
                    case 'oldest':
                        order = [['confirmedAt', 'ASC']];
                        break;
                    case 'amountHigh':
                        order = [['amount', 'DESC']];
                        break;
                    case 'amountLow':
                        order = [['amount', 'ASC']];
                        break;
                    default:
                        order = [['confirmedAt', 'DESC']];
                }
            }

            const transactionResult = await db.Transaction.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.Order,
                        as: 'order',
                        attributes: ['trackingNumber'],
                    },
                ],
                order,
                limit: parseInt(limit) || 10,
                offset: ((parseInt(page) - 1) * parseInt(limit)) || 0,
            });

            return {
                success: true,
                message: 'Lấy danh sách giao dịch thành công',
                transactions: transactionResult.rows,
                total: Array.isArray(transactionResult.count) ? transactionResult.count.length : transactionResult.count,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
            };
        } catch (error) {
            console.error('Get Transactions By User error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async exportUserTransactions(userId, filters) {
        try {
            const { Op, fn, col, literal } = db.Sequelize;

            // Kiểm tra user
            const user = await db.User.findOne({ where: { id: userId } });
            if (!user) return { success: false, message: 'Người dùng không tồn tại' };

            let whereCondition = { userId };

            // Lọc dữ liệu
            const { searchText, type, startDate, endDate, sort } = filters || {};

            if (searchText && searchText.trim()) {
                const keyword = `%${searchText.trim()}%`;

                whereCondition[Op.or] = [
                    { id: { [Op.like]: keyword } },
                    { paymentSubmissionId: { [Op.like]: keyword } },
                    { '$order.trackingNumber$': { [Op.like]: keyword } },
                ];
            }

            if (type && type !== 'All') whereCondition.type = type;

            if (startDate && endDate) {
                whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
            }

            let order = [['confirmedAt', 'DESC']];

            if (sort && sort !== 'none') {
                switch (sort) {
                    case 'newest':
                        order = [['confirmedAt', 'DESC']];
                        break;
                    case 'oldest':
                        order = [['confirmedAt', 'ASC']];
                        break;
                    case 'amountHigh':
                        order = [['amount', 'DESC']];
                        break;
                    case 'amountLow':
                        order = [['amount', 'ASC']];
                        break;
                    default:
                        order = [['confirmedAt', 'DESC']];
                }
            }

            const transactionResult = await db.Transaction.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.Order,
                        as: 'order',
                        attributes: ['trackingNumber'],
                    },
                ],
                order,
            });

            return {
                success: true,
                message: 'Lấy danh sách giao dịch xuất Excel thành công',
                transactions: transactionResult.rows,
            };
        } catch (error) {
            console.error('Get Export User Transactions error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },
}

export default transactionService

export {
    createUserTransaction,
    createManagerShipTransaction,
    createRefundUserTransaction,
};