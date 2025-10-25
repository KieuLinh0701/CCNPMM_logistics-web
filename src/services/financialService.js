import db from '../models/index.js';

const financialService = {
  // Lấy thống kê thu chi theo khoảng thời gian
  async getFinancialStats(filters) {
    try {
      console.log('=== FINANCIAL SERVICE: getFinancialStats ===');
      console.log('Filters received:', filters);

      const {
        startDate,
        endDate,
        officeId,
        regionType
      } = filters;

      const where = {};
      
      // Filter by date range
      if (startDate && endDate) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [startDate, endDate]
        };
      }

      // Filter by office
      if (officeId) {
        where.toOfficeId = officeId;
      }

      // Filter by region type
      if (regionType) {
        where.regionType = regionType;
      }

      console.log('Where clause:', where);

      // Lấy thống kê cơ bản
      const [
        totalOrders,
        totalCOD,
        totalShippingFee,
        totalDiscount,
        deliveredOrders,
        codCollected,
        shippingFeeCollected
      ] = await Promise.all([
        // Tổng số đơn hàng
        db.Order.count({ where }),
        
        // Tổng COD
        db.Order.sum('cod', { where }),
        
        // Tổng phí vận chuyển
        db.Order.sum('shippingFee', { where }),
        
        // Tổng giảm giá
        db.Order.sum('discountAmount', { where }),
        
        // Số đơn đã giao thành công
        db.Order.count({ 
          where: { 
            ...where, 
            status: 'delivered' 
          } 
        }),
        
        // COD đã thu từ đơn đã giao
        db.Order.sum('cod', { 
          where: { 
            ...where, 
            status: 'delivered',
            cod: { [db.Sequelize.Op.gt]: 0 }
          } 
        }),
        
        // Phí vận chuyển đã thu từ đơn đã giao
        db.Order.sum('shippingFee', { 
          where: { 
            ...where, 
            status: 'delivered' 
          } 
        })
      ]);

      // Tính tổng doanh thu thủ công
      const totalRevenue = (totalCOD || 0) + (totalShippingFee || 0) - (totalDiscount || 0);

      // Lấy thống kê theo bưu cục
      const officeStats = await db.Order.findAll({
        where,
        attributes: [
          'toOfficeId',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('Order.id')), 'orderCount'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.cod')), 'totalCOD'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.shippingFee')), 'totalShippingFee'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.discountAmount')), 'totalDiscount'],
          [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN Order.status = "delivered" THEN 1 END')), 'deliveredCount']
        ],
        include: [
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'address']
          }
        ],
        group: ['toOfficeId'],
        order: [[db.Sequelize.literal('(SUM(Order.cod) + SUM(Order.shippingFee) - SUM(Order.discountAmount))'), 'DESC']]
      });

      // Tính tổng doanh thu cho từng bưu cục
      const officeStatsWithRevenue = officeStats.map(office => {
        const totalCOD = parseFloat(office.dataValues.totalCOD) || 0;
        const totalShippingFee = parseFloat(office.dataValues.totalShippingFee) || 0;
        const totalDiscount = parseFloat(office.dataValues.totalDiscount) || 0;
        const totalRevenue = totalCOD + totalShippingFee - totalDiscount;
        
        return {
          ...office.dataValues,
          totalRevenue
        };
      });

      // Lấy thống kê theo loại dịch vụ
      const serviceTypeStats = await db.Order.findAll({
        where,
        attributes: [
          'serviceTypeId',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('Order.id')), 'orderCount'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.cod')), 'totalCOD'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.shippingFee')), 'totalShippingFee'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.discountAmount')), 'totalDiscount']
        ],
        include: [
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name']
          }
        ],
        group: ['serviceTypeId'],
        order: [[db.Sequelize.literal('(SUM(Order.cod) + SUM(Order.shippingFee) - SUM(Order.discountAmount))'), 'DESC']]
      });

      // Tính tổng doanh thu cho từng loại dịch vụ
      const serviceTypeStatsWithRevenue = serviceTypeStats.map(service => {
        const totalCOD = parseFloat(service.dataValues.totalCOD) || 0;
        const totalShippingFee = parseFloat(service.dataValues.totalShippingFee) || 0;
        const totalDiscount = parseFloat(service.dataValues.totalDiscount) || 0;
        const totalRevenue = totalCOD + totalShippingFee - totalDiscount;
        
        return {
          ...service.dataValues,
          totalRevenue
        };
      });

      // Lấy thống kê theo tháng (cho biểu đồ)
      const monthlyStats = await db.Order.findAll({
        where,
        attributes: [
          [db.Sequelize.fn('DATE_FORMAT', db.Sequelize.col('Order.createdAt'), '%Y-%m'), 'month'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('Order.id')), 'orderCount'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.cod')), 'totalCOD'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.shippingFee')), 'totalShippingFee'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('Order.discountAmount')), 'totalDiscount']
        ],
        group: [db.Sequelize.fn('DATE_FORMAT', db.Sequelize.col('Order.createdAt'), '%Y-%m')],
        order: [[db.Sequelize.fn('DATE_FORMAT', db.Sequelize.col('Order.createdAt'), '%Y-%m'), 'ASC']]
      });

      // Tính tổng doanh thu cho từng tháng
      const monthlyStatsWithRevenue = monthlyStats.map(month => {
        const totalCOD = parseFloat(month.dataValues.totalCOD) || 0;
        const totalShippingFee = parseFloat(month.dataValues.totalShippingFee) || 0;
        const totalDiscount = parseFloat(month.dataValues.totalDiscount) || 0;
        const totalRevenue = totalCOD + totalShippingFee - totalDiscount;
        
        return {
          ...month.dataValues,
          totalRevenue
        };
      });

      const result = {
        summary: {
          totalOrders: totalOrders || 0,
          totalCOD: totalCOD || 0,
          totalShippingFee: totalShippingFee || 0,
          totalDiscount: totalDiscount || 0,
          totalRevenue: totalRevenue,
          deliveredOrders: deliveredOrders || 0,
          codCollected: codCollected || 0,
          shippingFeeCollected: shippingFeeCollected || 0,
          successRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0
        },
        officeStats: officeStatsWithRevenue || [],
        serviceTypeStats: serviceTypeStatsWithRevenue || [],
        monthlyStats: monthlyStatsWithRevenue || []
      };

      console.log('Financial stats result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Get financial stats error:', error);
      console.error('Error stack:', error.stack);
      return { success: false, message: 'Lỗi khi lấy thống kê tài chính' };
    }
  },

  // Lấy lịch sử đối soát theo bưu cục
  async getReconciliationHistory(filters) {
    try {
      console.log('=== FINANCIAL SERVICE: getReconciliationHistory ===');
      console.log('Filters received:', filters);

      const {
        startDate,
        endDate,
        officeId,
        page = 1,
        limit = 10
      } = filters;

      const offset = (page - 1) * limit;
      const where = {};

      if (startDate && endDate) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [startDate, endDate]
        };
      }

      if (officeId) {
        where.toOfficeId = officeId;
      }

      // Lấy đơn hàng đã giao để đối soát
      where.status = 'delivered';

      const { rows, count } = await db.Order.findAndCountAll({
        where,
        include: [
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'address']
          },
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name']
          }
        ],
        order: [['deliveredAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      // Tính tổng kết
      const summary = await db.Order.findOne({
        where,
        attributes: [
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'totalOrders'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('cod')), 'totalCOD'],
          [db.Sequelize.fn('SUM', db.Sequelize.col('shippingFee')), 'totalShippingFee'],
          [db.Sequelize.fn('SUM', db.Sequelize.literal('cod + shippingFee - discountAmount')), 'totalRevenue']
        ]
      });

      return {
        success: true,
        data: {
          orders: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count
          },
          summary: {
            totalOrders: summary?.dataValues?.totalOrders || 0,
            totalCOD: summary?.dataValues?.totalCOD || 0,
            totalShippingFee: summary?.dataValues?.totalShippingFee || 0,
            totalRevenue: summary?.dataValues?.totalRevenue || 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Get reconciliation history error:', error);
      return { success: false, message: 'Lỗi khi lấy lịch sử đối soát' };
    }
  },

  // Lấy báo cáo tổng hợp
  async getComprehensiveReport(filters) {
    try {
      console.log('=== FINANCIAL SERVICE: getComprehensiveReport ===');
      console.log('Filters received:', filters);

      const {
        startDate,
        endDate,
        officeId,
        regionType
      } = filters;

      const where = {};

      if (startDate && endDate) {
        where.createdAt = {
          [db.Sequelize.Op.between]: [startDate, endDate]
        };
      }

      if (officeId) {
        where.toOfficeId = officeId;
      }

      if (regionType) {
        where.regionType = regionType;
      }

      // Thống kê tổng quan
      const [
        totalOrders,
        totalOffices,
        totalEmployees,
        totalVehicles,
        successRate,
        totalCOD,
        totalShippingFee,
        totalDiscount
      ] = await Promise.all([
        // Tổng số đơn hàng
        db.Order.count({ where }),
        
        // Tổng số bưu cục
        db.Office.count(),
        
        // Tổng số nhân viên
        db.Employee.count({ where: { status: 'Active' } }),
        
        // Tổng số phương tiện
        db.Vehicle.count(),
        
        // Tỷ lệ giao thành công
        db.Order.findOne({
          where,
          attributes: [
            [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN Order.status = "delivered" THEN 1 END')), 'delivered'],
            [db.Sequelize.fn('COUNT', db.Sequelize.col('Order.id')), 'total']
          ]
        }),
        
        // Tổng COD
        db.Order.sum('cod', { where }),
        
        // Tổng phí vận chuyển
        db.Order.sum('shippingFee', { where }),
        
        // Tổng giảm giá
        db.Order.sum('discountAmount', { where })
      ]);

      // Tính tổng doanh thu thủ công
      const totalRevenue = (totalCOD || 0) + (totalShippingFee || 0) - (totalDiscount || 0);

      const successRateValue = successRate?.dataValues?.total > 0 
        ? ((successRate.dataValues.delivered / successRate.dataValues.total) * 100).toFixed(2)
        : 0;

      return {
        success: true,
        data: {
          totalOrders: totalOrders || 0,
          totalOffices: totalOffices || 0,
          totalEmployees: totalEmployees || 0,
          totalVehicles: totalVehicles || 0,
          successRate: parseFloat(successRateValue),
          totalRevenue: totalRevenue || 0
        }
      };
    } catch (error) {
      console.error('❌ Get comprehensive report error:', error);
      return { success: false, message: 'Lỗi khi lấy báo cáo tổng hợp' };
    }
  }
};

export default financialService;
