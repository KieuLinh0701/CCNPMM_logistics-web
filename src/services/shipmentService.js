import db from '../models/index.js';

const shipmentService = {
    async getShipmentStatuses(userId) {
        try {
            const user = await db.User.count({
                where: { id: userId },
            });

            if (!user) {
                return { success: false, message: 'Người dùng không tồn tại' };
            }

            const statusesEnum = db.Shipment.rawAttributes.status.values;

            return {
                success: true,
                message: 'Lấy danh sách trạng thái vận chuyển thành công',
                statuses: statusesEnum,
            };
        } catch (error) {
            console.error('Get Status Enum error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async listEmployeeShipments(userId, employeeId, page = 1, limit = 10, filters = {}) {
        try {
            const { Op } = db.Sequelize;

            // 1. Kiểm tra user là manager và lấy office
            const manager = await db.User.findOne({
                where: { id: userId, role: 'manager' },
                include: [
                    {
                        model: db.Employee,
                        as: 'employee',
                        include: [{ model: db.Office, as: 'office' }]
                    }
                ],
            });

            if (!manager || !manager.employee) {
                return { success: false, message: 'User không tồn tại hoặc không phải manager' };
            }

            const officeId = manager.employee.officeId;

            // 2. Kiểm tra employee cùng office
            const employee = await db.Employee.findOne({
                where: { id: employeeId, officeId },
            });

            if (!employee) {
                return { success: false, message: 'Nhân viên không tồn tại hoặc không cùng office với manager' };
            }

            // 3. Build điều kiện lọc cho shipment
            const whereCondition = { userId: employee.userId };
            if (filters.status && filters.status !== 'All') {
                whereCondition.status = filters.status;
            }
            if (filters.startDate && filters.endDate) {
                whereCondition[Op.or] = [
                    { startTime: { [Op.between]: [filters.startDate, filters.endDate] } },
                    { endTime: { [Op.between]: [filters.startDate, filters.endDate] } },
                ];
            }

            // 4. Lấy shipment + shipmentOrders + order.weight
            const { rows: shipments, count } = await db.Shipment.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.ShipmentOrder,
                        as: 'shipmentOrders',
                        attributes: ['shipmentId'],
                        include: [
                            { model: db.Order, as: 'order', attributes: ['weight'] }
                        ],
                    },
                    { model: db.Vehicle, as: 'vehicle' },
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                distinct: true,
            });

            // 5. Map dữ liệu trả về, tính tổng weight và số lượng order
            const shipmentData = shipments.map(s => {
                const orderCount = s.shipmentOrders?.length || 0;
                const totalWeight = s.shipmentOrders?.reduce((sum, so) => sum + (so.order?.weight || 0), 0) || 0;

                return {
                    id: s.id,
                    status: s.status,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    vehicle: s.vehicle,
                    orderCount,
                    totalWeight,
                };
            });

            // 6. Sort theo yêu cầu nếu có
            if (filters.sort && filters.sort !== 'none') {
                switch (filters.sort) {
                    case 'orderCountHigh':
                        shipmentData.sort((a, b) => b.orderCount - a.orderCount);
                        break;
                    case 'orderCountLow':
                        shipmentData.sort((a, b) => a.orderCount - b.orderCount);
                        break;
                    case 'WeightHigh':
                        shipmentData.sort((a, b) => b.totalWeight - a.totalWeight);
                        break;
                    case 'WeightLow':
                        shipmentData.sort((a, b) => a.totalWeight - b.totalWeight);
                        break;
                    case 'newest':
                        shipmentData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                        break;
                    case 'oldest':
                        shipmentData.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                        break;
                }
            }

            return {
                success: true,
                message: 'Lấy danh sách shipment của employee thành công',
                shipments: shipmentData,
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
            };
        } catch (error) {
            console.error('listEmployeeShipments error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    }
}

export default shipmentService;