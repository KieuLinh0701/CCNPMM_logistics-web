import db from '../models/index.js';
import { Op } from 'sequelize';

const IncidentReportService = {
    // Lấy enum incidentType
    async getIncidentTypes(userId) {
        try {
            // Kiểm tra user tồn tại
            const user = await db.User.count({ where: { id: userId } });
            if (!user) {
                return { success: false, message: 'Người dùng không tồn tại' };
            }

            // Lấy enum incidentType từ model Incident
            const typesEnum = db.IncidentReport.rawAttributes.incidentType.values;

            return {
                success: true,
                message: 'Lấy danh sách loại sự cố thành công',
                types: typesEnum,
            };
        } catch (error) {
            console.error('Get Incident Types error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    // Lấy enum status
    async getIncidentStatuses(userId) {
        try {
            // Kiểm tra user tồn tại
            const user = await db.User.count({ where: { id: userId } });
            if (!user) {
                return { success: false, message: 'Người dùng không tồn tại' };
            }

            // Lấy enum status từ model Incident
            const statusesEnum = db.IncidentReport.rawAttributes.status.values;

            return {
                success: true,
                message: 'Lấy danh sách trạng thái sự cố thành công',
                statuses: statusesEnum,
            };
        } catch (error) {
            console.error('Get Incident Statuses error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    // Lấy danh sách báo cáo sự cố của bưu cục của manager
    async listOfficeIncidents(managerId, page = 1, limit = 10, filters = {}) {
        try {
            const { Op, fn, col } = require("sequelize");
            // Lấy thông tin manager + office
            const manager = await db.User.findOne({
                where: { id: managerId, role: 'manager' },
                include: [{ model: db.Employee, as: 'employee', include: [{ model: db.Office, as: 'office' }] }],
            });

            if (!manager || !manager.employee) {
                return { success: false, message: 'Manager không tồn tại hoặc không có office' };
            }

            const officeId = manager.employee.officeId;

            // Lấy danh sách incident của các shipper cùng office
            const whereCondition = {};
            const shipperWhere = { officeId }; // shipper cùng office

            // Filter trạng thái
            if (filters.status && filters.status !== 'All') {
                whereCondition.status = filters.status;
            }

            // Filter loại sự cố
            if (filters.type && filters.type !== 'All') {
                whereCondition.incidentType = filters.type;
            }

            // Filter ngày tạo
            if (filters.startDate && filters.endDate) {
                whereCondition.createdAt = { [Op.between]: [filters.startDate, filters.endDate] };
            }

            // Filter searchText
            if (filters.searchText) {
                const search = `%${filters.searchText}%`;
                whereCondition[Op.or] = [
                    { '$order.trackingNumber$': { [Op.like]: search } },
                    { title: { [Op.like]: search } },
                    { recipientName: { [Op.like]: search } },
                    { recipientPhone: { [Op.like]: search } },
                    { '$handler.lastName$': { [Op.like]: search } },
                    { '$handler.firstName$': { [Op.like]: search } },
                ];
            }

            // Sort
            let order = [['createdAt', 'DESC']];
            if (filters.sort === 'oldest') order = [['createdAt', 'ASC']];

            const incidents = await db.IncidentReport.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: db.User,
                        as: 'shipper',
                        include: [{ model: db.Employee, as: 'employee', where: shipperWhere }],
                    },
                    { model: db.User, as: 'handler' },
                    { model: db.Order, as: 'order' },
                ],
                order,
                limit,
                offset: (page - 1) * limit,
            });

            // Lấy tổng số theo trạng thái (không lọc)
            const statusesEnum = db.IncidentReport.rawAttributes.status.values; // tất cả trạng thái

            const statusCounts = await db.IncidentReport.findAll({
                attributes: ['status', [fn('COUNT', col('IncidentReport.id')), 'count']],
                include: [
                    {
                        model: db.User,
                        as: 'shipper',
                        attributes: [],
                        include: [
                            {
                                model: db.Employee,
                                as: 'employee',
                                attributes: [],
                                where: { officeId } // lọc shipper cùng office
                            }
                        ]
                    }
                ],
                group: ['status'],
                raw: true,
            });

            const statusMap = {};
            statusCounts.forEach(s => { statusMap[s.status] = Number(s.count); });

            const totalByStatus = statusesEnum.map(status => ({
                key: status,
                value: statusMap[status] || 0
            }));

            return { success: true, incidents: incidents.rows, total: incidents.count, totalByStatus: totalByStatus };
        } catch (error) {
            console.error('listOfficeIncidents error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },

    async handleIncident(managerId, incidentId, data) {
        try {
            const incident = await db.IncidentReport.findByPk(incidentId, {
                include: [{ model: db.User, as: 'shipper', include: [{ model: db.Employee, as: 'employee' }] }],
            });

            if (!incident) return { success: false, message: 'Báo cáo không tồn tại' };

            const officeId = incident.shipper.employee.officeId;

            // Kiểm tra manager cùng office
            const manager = await db.User.findOne({
                where: { id: managerId, role: 'manager' },
                include: [{ model: db.Employee, as: 'employee' }],
            });
            if (!manager || manager.employee.officeId !== officeId) {
                return { success: false, message: 'Manager không có quyền xử lý báo cáo này' };
            }

            // Kiểm tra chuyển trạng thái hợp lý
            const currentStatus = incident.status;
            const nextStatus = data.status;

            const allowedTransitions = {
                pending: ['processing', 'resolved', 'rejected'],
                processing: ['resolved', 'rejected'],
                resolved: [],
                rejected: [],
            };

            if (nextStatus && !allowedTransitions[currentStatus].includes(nextStatus)) {
                return { success: false, message: `Không thể chuyển từ ${currentStatus} sang ${nextStatus}` };
            }

            // Cập nhật
            if (nextStatus) incident.status = nextStatus;
            if (data.resolution) incident.resolution = data.resolution;
            incident.handledBy = managerId;
            incident.handledAt = new Date();

            await incident.save();

            return { success: true, incident };
        } catch (error) {
            console.error('handleIncident error:', error);
            return { success: false, message: 'Lỗi server' };
        }
    },
};

export default IncidentReportService;