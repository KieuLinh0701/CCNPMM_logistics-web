import db from '../models';
import { createTransaction } from './transactionService';

const { Op } = db.Sequelize;

const paymentSubmissionService = {
  async getPaymentSubmissionStatuses(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum status từ model Order
      const statusesEnum = db.PaymentSubmission.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh sách trạng thái đối soát thành công',
        statuses: statusesEnum,
      };
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Hàm tổng quát lấy summary theo status
  async getUserOrdersSummaryByStatus(userId, status) {
    try {
      // Kiểm tra user
      const user = await db.User.findByPk(userId);
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Lấy tất cả đơn hàng của user
      const userOrders = await db.Order.findAll({
        where: { userId },
        attributes: ['id', 'cod', 'orderValue'],
      });

      if (!userOrders.length) {
        return { success: true, totalCOD: 0, totalOrderValue: 0, orderCount: 0 };
      }

      const userOrderIds = userOrders.map(o => o.id);

      // ✅ Cho phép truyền 1 status hoặc nhiều status
      const statusCondition = Array.isArray(status)
        ? { [Op.in]: status }
        : status;

      // Lấy PaymentSubmission theo status (có thể nhiều)
      const submissions = await db.PaymentSubmission.findAll({
        where: { status: statusCondition },
        attributes: ['orderIds'],
      });

      // Lọc orderIds chỉ lấy những order của user
      const filteredOrderIds = submissions
        .map(sub => Array.isArray(sub.orderIds) ? sub.orderIds.filter(id => userOrderIds.includes(id)) : [])
        .flat();

      if (!filteredOrderIds.length) {
        return { success: true, totalCOD: 0, totalOrderValue: 0, orderCount: 0 };
      }

      // Lấy chi tiết các đơn hàng
      const filteredOrders = userOrders.filter(o => filteredOrderIds.includes(o.id));

      const totalCOD = filteredOrders.reduce((sum, o) => sum + o.cod, 0);
      const totalOrderValue = filteredOrders.reduce((sum, o) => sum + o.orderValue, 0);

      return {
        success: true,
        totalCOD,
        totalOrderValue,
        orderCount: filteredOrders.length,
      };
    } catch (error) {
      console.error('getUserOrdersSummaryByStatus error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Wrapper cho Pending
  async getUserPendingOrdersSummary(userId) {
    return this.getUserOrdersSummaryByStatus(userId, 'Pending');
  },

  // Wrapper cho Confirmed
  async getUserConfirmedOrdersSummary(userId) {
    return this.getUserOrdersSummaryByStatus(userId, ['Confirmed', 'Adjusted']);
  },

  // ============= Manager ==============

  // Lấy danh sách các PaymentSubmission của bưu cục mà manager đang quản lý
  async listManagerPaymentSubmissions(managerId, page, limit, filters = {}) {
    try {
      const { Op } = db.Sequelize;
      const { status, sort, startDate, endDate, searchText } = filters;

      // 1️⃣ Lấy officeId mà manager phụ trách
      const employee = await db.Employee.findOne({
        where: { userId: managerId },
        attributes: ['officeId'],
      });

      if (!employee) {
        return { success: false, message: 'Manager không thuộc bưu cục nào' };
      }

      const officeId = employee.officeId;

      // 2️⃣ Điều kiện lọc chính
      const whereCondition = { officeId };
      if (status) whereCondition.status = status;
      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
      }

      // 3️⃣ Tìm kiếm nâng cao
      if (searchText && searchText.trim() !== '') {
        const keyword = `%${searchText.trim()}%`;

        // 3.1 Tìm theo mã đơn hàng (trackingNumber)
        const matchedOrders = await db.Order.findAll({
          where: { trackingNumber: { [Op.like]: keyword } },
          attributes: ['id'],
        });
        const matchedOrderIds = matchedOrders.map((o) => o.id);

        // 3.2 Tìm theo tên người nộp / xác nhận
        const matchedUsers = await db.User.findAll({
          where: {
            [Op.or]: [
              { firstName: { [Op.like]: keyword } },
              { lastName: { [Op.like]: keyword } },
              db.Sequelize.where(
                db.Sequelize.fn(
                  'concat',
                  db.Sequelize.col('lastName'),
                  ' ',
                  db.Sequelize.col('firstName')
                ),
                { [Op.like]: keyword }
              ),
            ],
          },
          attributes: ['id'],
        });
        const matchedUserIds = matchedUsers.map((u) => u.id);

        // 3.3 Tìm submission theo nhiều tiêu chí
        const allSubmissions = await db.PaymentSubmission.findAll({
          where: {
            [Op.or]: [
              { id: { [Op.like]: keyword } },
              { notes: { [Op.like]: keyword } },
              { submittedById: { [Op.in]: matchedUserIds } },
              { confirmedById: { [Op.in]: matchedUserIds } },
            ],
          },
          attributes: ['id', 'orderIds'],
        });

        // 3.4 Lọc theo orderIds
        const matchedSubmissionIdsFromOrders = allSubmissions
          .filter(
            (s) =>
              Array.isArray(s.orderIds) &&
              s.orderIds.some((oid) => matchedOrderIds.includes(oid))
          )
          .map((s) => s.id);

        const matchedIdsFromBase = allSubmissions.map((s) => s.id);
        const matchedSubmissionIds = [
          ...new Set([...matchedIdsFromBase, ...matchedSubmissionIdsFromOrders]),
        ];

        if (matchedSubmissionIds.length) {
          whereCondition.id = { [Op.in]: matchedSubmissionIds };
        } else {
          return {
            success: true,
            message: 'Không tìm thấy kết quả phù hợp',
            submissions: [],
            total: 0,
            page,
            limit,
          };
        }
      }

      // 4️⃣ Sắp xếp
      let order = [['createdAt', 'DESC']];
      switch (sort) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'amountHigh':
          order = [['totalAmountSubmitted', 'DESC']];
          break;
        case 'amountLow':
          order = [['totalAmountSubmitted', 'ASC']];
          break;
      }

      // 5️⃣ Query chính có phân trang (findAndCountAll)
      const submissionsResult = await db.PaymentSubmission.findAndCountAll({
        where: whereCondition,
        order,
        limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: db.User,
            as: 'submittedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: db.User,
            as: 'confirmedBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });

      return {
        success: true,
        message: 'Lấy danh sách đối soát thành công',
        paymentSubmissions: submissionsResult.rows,
        total: submissionsResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error('listManagerPaymentSubmissions error:', error);
      return { success: false, message: 'Lỗi server khi lấy đối soát' };
    }
  },

  async getOrdersOfPaymentSubmission(managerId, submissionId, page, limit) {
    try {
      // 1. Kiểm tra Manager có thuộc bưu cục nào không
      const employee = await db.Employee.findOne({
        where: { userId: managerId },
        attributes: ['officeId'],
      });

      if (!employee) {
        return { success: false, message: 'Manager không thuộc bưu cục nào' };
      }

      const officeId = employee.officeId;

      // 2. Lấy đối soát cần xem
      const submission = await db.PaymentSubmission.findOne({
        where: { id: submissionId, officeId },
        attributes: ['id', 'orderIds'],
      });

      if (!submission) {
        return { success: false, message: 'Đối soát không tồn tại hoặc không thuộc bưu cục của bạn' };
      }

      // 3. Lấy danh sách orderIds
      const orderIds = Array.isArray(submission.orderIds) ? submission.orderIds : [];

      if (orderIds.length === 0) {
        return { success: true, message: 'Đối soát này chưa có đơn hàng', orders: [], total: 0, page, limit };
      }

      // 4. Lấy danh sách đơn hàng có phân trang
      const { rows: orders, count: total } = await db.Order.findAndCountAll({
        where: { id: { [Op.in]: orderIds } },
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

      return {
        success: true,
        message: 'Lấy danh sách đơn hàng trong đối soát thành công',
        orders,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('getOrdersOfPaymentSubmission error:', error);
      return { success: false, message: 'Lỗi server khi lấy danh sách đơn hàng của đối soát' };
    }
  },

  async updatePaymentSubmissionStatus({ userId, submissionId, status, notes }) {
    const t = await db.sequelize.transaction();
    try {
      // 1️⃣ Kiểm tra Manager có thuộc bưu cục
      const employee = await db.Employee.findOne({
        where: { userId },
        attributes: ['officeId'],
      });

      if (!employee) {
        return { success: false, message: 'Manager không thuộc bưu cục nào' };
      }

      const officeId = employee.officeId;

      // 2️⃣ Lấy PaymentSubmission
      const submission = await db.PaymentSubmission.findOne({
        where: { id: submissionId, officeId },
        transaction: t,
      });

      if (!submission) {
        return { success: false, message: 'Đối soát không tồn tại hoặc bạn không có quyền cập nhật' };
      }

      const currentStatus = submission.status;

      // 3️⃣ Kiểm tra chuyển trạng thái hợp lệ
      const allowedTransitions = {
        Pending: ['Confirmed', 'Rejected'],
        Rejected: ['Adjusted'],
      };

      const allowedNextStatuses = allowedTransitions[currentStatus] || [];
      if (!allowedNextStatuses.includes(status)) {
        return {
          success: false,
          message: `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}`,
        };
      }

      // 4️⃣ Cập nhật trạng thái và ghi chú
      submission.status = status;
      submission.notes = notes || submission.notes;

      if (status === 'Confirmed' || status === 'Adjusted') {
        submission.confirmedAt = new Date();
        submission.confirmedById = userId;
        submission.reconciledAt = new Date();

        // 5️⃣ Lấy chi tiết các đơn hàng trong lô để tạo transaction
        const orders = await db.Order.findAll({
          where: { id: submission.orderIds },
          transaction: t,
        });

        for (const order of orders) {
          // Income user (COD)
          if (order.cod && order.userId) {
            await createTransaction({
              orderId: order.id,
              userId: order.userId,
              amount: order.cod,
              type: 'Income',
              purpose: 'CODReturn',
              method: 'VNPay',
              title: 'Thanh toán tiền COD',
              notes: `Thanh toán tiền COD cho đơn hàng #${order.trackingNumber}`,
            }, { transaction: t });
          }

          // Income office (totalFee)
          if (order.totalFee && officeId) {
            await createTransaction({
              orderId: order.id,
              officeId: officeId,
              amount: order.totalFee,
              type: 'Income',
              purpose: 'ShippingService',
              method: 'Cash',
              title: 'Thu phí vận chuyển từ đơn hàng',
              notes: `Thu phí vận chuyển từ đơn hàng #${order.trackingNumber} qua đối soát #${submission.id}`,
            }, { transaction: t });
          }
        }
      }

      await submission.save({ transaction: t });
      await t.commit();

      return { success: true, message: 'Cập nhật trạng thái thành công', data: submission };
    } catch (error) {
      console.error('updateStatus error:', error);
      if (!t.finished) await t.rollback();
      return { success: false, message: 'Lỗi server khi cập nhật trạng thái' };
    }
  },

  async getPaymentSubmissionCountByStatus(managerId) {
    try {
      const { Op } = db.Sequelize;

      // 1️⃣ Lấy bưu cục của manager
      const employee = await db.Employee.findOne({
        where: { userId: managerId },
        attributes: ['officeId'],
      });

      if (!employee) {
        return { success: false, message: 'Manager không thuộc bưu cục nào' };
      }

      const officeId = employee.officeId;

      // 2️⃣ Lấy danh sách các trạng thái từ enum của model
      const statuses = db.PaymentSubmission.rawAttributes.status.values;

      // 3️⃣ Đếm và tính tổng theo từng trạng thái
      const results = await Promise.all(
        statuses.map(async (status) => {
          const whereCondition = { officeId, status };

          const count = await db.PaymentSubmission.count({ where: whereCondition });

          const totalAmountResult = await db.PaymentSubmission.findOne({
            where: whereCondition,
            attributes: [
              [db.Sequelize.fn('SUM', db.Sequelize.col('totalAmountSubmitted')), 'totalAmount'],
            ],
            raw: true,
          });

          return {
            status,
            count,
            totalAmount: Number(totalAmountResult.totalAmount) || 0,
          };
        })
      );

      // 4️⃣ Trả kết quả
      return {
        success: true,
        message: 'Thống kê số lượng và tổng tiền đối soát theo trạng thái thành công',
        summary: results,
      };
    } catch (error) {
      console.error('getPaymentSubmissionCountByStatus error:', error);
      return { success: false, message: 'Lỗi server khi thống kê đối soát' };
    }
  },
};

export default paymentSubmissionService;