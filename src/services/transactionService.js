import db from '../models';
import paymentSubmission from '../models/paymentSubmission';

const { Op, fn, col, literal } = require("sequelize");

async function createTransaction({ orderId = null, userId = null, officeId = null, amount, type, purpose, method = null, title = '', status = 'Confirmed', notes = '', transaction, confirmedAt = new Date() }) {
    return await db.Transaction.create({
        orderId,
        userId,
        officeId,
        amount,
        type,
        purpose,
        method,
        title,
        status,
        confirmedAt,
        notes,
    }, { transaction });
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

    async getTransactionStatuses(userId) {
        try {
            const user = await db.User.count({
                where: { id: userId },
            });

            if (!user) {
                return { success: false, message: 'Người dùng không tồn tại' };
            }

            const statusesEnum = db.Transaction.rawAttributes.status.values;

            return {
                success: true,
                message: 'Lấy danh sách trạng thái giao dịch  thành công',
                statuses: statusesEnum,
            };
        } catch (error) {
            console.error('Get Status Enum error:', error);
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

    // ============================ Manager ===============================================

    async listManagerTransactions(managerId, page, limit, filters) {
        try {
            const { Op } = db.Sequelize;

            // Tìm xem manager này thuộc office nào
            const employee = await db.Employee.findOne({
                where: { userId: managerId },
                include: [{ model: db.Office, as: 'office', attributes: ['id', 'name'] }],
            });

            if (!employee) return { success: false, message: 'Manager không tồn tại hoặc chưa thuộc văn phòng nào' };
            const officeId = employee.officeId;

            let whereCondition = { officeId };

            const { searchText, type, status, startDate, endDate, sort } = filters || {};

            if (searchText && searchText.trim()) {
                const keyword = `%${searchText.trim()}%`;
                whereCondition[Op.or] = [
                    { id: { [Op.like]: keyword } },
                    { paymentSubmissionId: { [Op.like]: keyword } },
                    { title: { [Op.like]: keyword } },
                    { '$order.trackingNumber$': { [Op.like]: keyword } },
                ];
            }

            if (type && type !== 'All') whereCondition.type = type;

            if (status && status !== 'All') whereCondition.status = status;

            if (startDate && endDate) {
                whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
            }

            let order = [['confirmedAt', 'DESC']];
            if (sort && sort !== 'none') {
                switch (sort) {
                    case 'newest': order = [['confirmedAt', 'DESC']]; break;
                    case 'oldest': order = [['confirmedAt', 'ASC']]; break;
                    case 'amountHigh': order = [['amount', 'DESC']]; break;
                    case 'amountLow': order = [['amount', 'ASC']]; break;
                    default: order = [['confirmedAt', 'DESC']];
                }
            }

            const transactionResult = await db.Transaction.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.Order,
                        as: 'order',
                        attributes: ['trackingNumber'],
                        required: false,
                    },
                    {
                        model: db.TransactionImage,
                        as: 'images',
                        attributes: ['url'],
                    },
                ],
                order,
                subQuery: false,
                limit: parseInt(limit) || 10,
                offset: ((parseInt(page) - 1) * parseInt(limit)) || 0,
            });

            return {
                success: true,
                message: 'Lấy danh sách giao dịch cho manager thành công',
                transactions: transactionResult.rows,
                total: Array.isArray(transactionResult.count) ? transactionResult.count.length : transactionResult.count,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                officeId,
            };
        } catch (error) {
            console.error('Get Transactions By Manager error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async exportManagerTransactions(managerId, filters) {
        try {
            const { Op } = db.Sequelize;

            // Tìm office mà manager thuộc về
            const employee = await db.Employee.findOne({
                where: { userId: managerId },
                include: [{ model: db.Office, as: 'office', attributes: ['id', 'name'] }],
            });

            if (!employee) return { success: false, message: 'Manager không tồn tại hoặc chưa thuộc văn phòng nào' };
            const officeId = employee.officeId;

            let whereCondition = { officeId };

            const { searchText, type, status, startDate, endDate, sort } = filters || {};

            if (searchText && searchText.trim()) {
                const keyword = `%${searchText.trim()}%`;
                whereCondition[Op.or] = [
                    { id: { [Op.like]: keyword } },
                    { title: { [Op.like]: keyword } },
                    { paymentSubmissionId: { [Op.like]: keyword } },
                    { '$order.trackingNumber$': { [Op.like]: keyword } },
                ];
            }

            if (type && type !== 'All') whereCondition.type = type;

            if (status && status !== 'All') whereCondition.status = status;

            if (startDate && endDate) {
                whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
            }

            let order = [['confirmedAt', 'DESC']];
            if (sort && sort !== 'none') {
                switch (sort) {
                    case 'newest': order = [['confirmedAt', 'DESC']]; break;
                    case 'oldest': order = [['confirmedAt', 'ASC']]; break;
                    case 'amountHigh': order = [['amount', 'DESC']]; break;
                    case 'amountLow': order = [['amount', 'ASC']]; break;
                    default: order = [['confirmedAt', 'DESC']];
                }
            }

            const transactionResult = await db.Transaction.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.Order,
                        as: 'order',
                        attributes: ['trackingNumber'],
                        required: false,
                    },
                ],
                order,
                subQuery: false,
            });

            return {
                success: true,
                message: 'Lấy danh sách giao dịch cho manager để xuất Excel thành công',
                transactions: transactionResult.rows,
                officeId,
            };
        } catch (error) {
            console.error('Export Transactions By Manager error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    // Tính tổng thu, tổng chi và lợi nhuận của bưu cục
    async getManagerTransactionSummary(managerId, filters) {
        try {
            const { Op, fn, col } = db.Sequelize;

            const employee = await db.Employee.findOne({
                where: { userId: managerId },
                attributes: ['officeId'],
            });

            if (!employee) return { success: false, message: 'Manager không thuộc văn phòng nào' };
            const officeId = employee.officeId;

            const { startDate, endDate } = filters || {};

            const whereCondition = { officeId };
            if (startDate && endDate) {
                whereCondition.confirmedAt = { [Op.between]: [startDate, endDate] };
            }

            // Tổng thu
            const totalIncome = await db.Transaction.sum('amount', {
                where: { ...whereCondition, type: 'Income' },
            });

            // Tổng chi
            const totalExpense = await db.Transaction.sum('amount', {
                where: { ...whereCondition, type: 'Expense' },
            });

            // Tính chênh lệch
            const balance = (totalIncome || 0) - (totalExpense || 0);

            return {
                success: true,
                message: 'Thống kê tổng thu - tổng chi thành công',
                totalIncome: totalIncome || 0,
                totalExpense: totalExpense || 0,
                balance,
            };
        } catch (error) {
            console.error('Get Manager Summary error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async createTransaction(managerId, data) {
        const { title, amount, notes, images, purpose = 'OfficeExpense', type = 'Expense', status = 'Pending' } = data;
        const t = await db.sequelize.transaction();

        try {
            const employee = await db.Employee.findOne({
                where: { userId: managerId },
                attributes: ['officeId'],
            });

            if (!employee) return { success: false, message: 'Manager không thuộc văn phòng nào' };
            const officeId = employee.officeId;

            const finalTitle = title?.trim() || (() => {
                switch (purpose) {
                    case 'ShippingService':
                        return `Trả phí ship`;
                    case 'Refund':
                        return `Hoàn tiền`;
                    case 'OfficeExpense':
                        return `Chi phí phát sinh văn phòng`;
                    case 'RevenueTransfer':
                        return `Chuyển doanh thu`;
                    default:
                        return 'Giao dịch';
                }
            })();

            // 1. Tạo transaction
            const transaction = await db.Transaction.create({
                officeId,
                amount,
                type,
                notes,
                method,
                purpose,
                title: finalTitle,
                status,
            }, { transaction: t });

            // 2. Lưu ảnh (nếu có)
            if (images && images.length > 0) {
                const imageRecords = images.map(file => ({
                    transactionId: transaction.id,
                    url: `/uploads/${file.filename}`,
                }));

                await db.TransactionImage.bulkCreate(imageRecords, { transaction: t });
            }

            await t.commit();

            // 3. Lấy transaction vừa tạo kèm ảnh
            const result = await db.Transaction.findOne({
                where: { id: transaction.id },
                include: [{ model: db.TransactionImage, as: 'images', attributes: ['url'] }]
            });

            return { success: true, message: 'Tạo giao dịch thành công', transaction: result };
        } catch (error) {
            await t.rollback();
            console.error('Create Transaction Service Error:', error);
            return { success: false, message: 'Tạo giao dịch thất bại' };
        }
    },
}

export default transactionService

export {
    createTransaction,
};