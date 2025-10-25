import db from '../models/index.js';

const orderHistoryService = {
    async getWarehouseImportExportStatsByManager(managerId, filters = {}) {
        try {
            const { searchText, serviceTypeId, sort } = filters;

            // 1 Lấy thông tin bưu cục của manager
            const employee = await db.Employee.findOne({
                where: { userId: managerId },
                include: [{ model: db.Office, as: 'office', attributes: ['id', 'name'] }],
                attributes: ['id', 'userId', 'officeId']
            });

            if (!employee || !employee.office) {
                return { success: false, message: 'Manager không thuộc bưu cục nào.' };
            }

            const officeId = employee.office.id;

            // 2 Lấy bản ghi OrderHistory mới nhất
            const latestHistories = await db.OrderHistory.findAll({
                include: [
                    {
                        model: db.Order,
                        as: 'order',
                        include: [{ model: db.ServiceType, as: 'serviceType' }]
                    }
                ],
                where: {
                    id: db.Sequelize.literal(`(
                    SELECT oh2.id
                    FROM \`OrderHistories\` AS oh2
                    WHERE oh2.orderId = OrderHistory.orderId
                    ORDER BY oh2.actionTime DESC
                    LIMIT 1
                    )`)
                }
            });

            // 3 Phân loại thống kê
            const incomingOrders = [];
            const inWarehouseOrders = [];
            const exportedOrders = [];

            for (const h of latestHistories) {
                if (h.action === 'Imported' && h.toOfficeId === officeId) inWarehouseOrders.push(h);
                else if (h.action === 'Exported' && h.fromOfficeId === officeId) exportedOrders.push(h);
                else if (
                    (h.action === 'PickedUp' || h.action === 'ReadyForPickup' || h.action === 'Exported')
                    && h.toOfficeId === officeId
                ) {
                    incomingOrders.push(h);
                }
            }

            // 4 Filter theo frontend request (search, serviceType)
            const filterOrders = (orders) => orders.filter(o => {
                const matchService = !serviceTypeId || serviceTypeId === 'All' || o.order.serviceTypeId === Number(serviceTypeId);
                const matchSearch = !searchText || o.order.trackingNumber.includes(searchText);
                return matchService && matchSearch;
            });

            const sortOrders = (orders) => {
                if (!sort) return orders;
                const sorted = [...orders];
                switch (sort) {
                    case 'oldest':
                        sorted.sort((a, b) => new Date(a.actionTime) - new Date(b.actionTime));
                        break;
                    case 'weightHigh':
                        sorted.sort((a, b) => b.order.weight - a.order.weight);
                        break;
                    case 'weightLow':
                        sorted.sort((a, b) => a.order.weight - b.order.weight);
                        break;
                    case 'newest':
                    default:
                        sorted.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime));
                }
                return sorted;
            };

            return {
                success: true,
                message: 'Thống kê kho thành công',
                warehouse: {
                    incomingCount: incomingOrders.length,
                    inWarehouseCount: inWarehouseOrders.length,
                    exportedCount: exportedOrders.length,
                    incomingOrders: sortOrders(filterOrders(incomingOrders)),
                    inWarehouseOrders: sortOrders(filterOrders(inWarehouseOrders)),
                    exportedOrders: sortOrders(filterOrders(exportedOrders))
                }
            };

        } catch (error) {
            console.error('getWarehouseImportExportStatsByManager error:', error);
            return { success: false, message: 'Lỗi server khi thống kê nhập xuất kho' };
        }
    },
}

export default orderHistoryService;