import db from '../models/index.js';
import { Op } from 'sequelize';

// Lấy danh sách tất cả promotion
export const getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Filter by status
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // Search by code or description
    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Promotion.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        promotions: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chương trình khuyến mãi',
      error: error.message
    });
  }
};

// Lấy chi tiết promotion theo ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await db.Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình khuyến mãi'
      });
    }

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin chương trình khuyến mãi',
      error: error.message
    });
  }
};

// Tạo promotion mới
export const createPromotion = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    // Validate discount value
    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm phải lớn hơn 0'
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Giảm giá phần trăm không được vượt quá 100%'
      });
    }

    const promotion = await db.Promotion.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chương trình khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi đã tồn tại'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo chương trình khuyến mãi',
      error: error.message
    });
  }
};

// Cập nhật promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const promotion = await db.Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình khuyến mãi'
      });
    }

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'Ngày kết thúc phải sau ngày bắt đầu'
        });
      }
    }

    // Validate discount value if provided
    if (updateData.discountValue && updateData.discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm phải lớn hơn 0'
      });
    }

    // Validate percentage discount
    if (updateData.discountType === 'percentage' && updateData.discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Giảm giá phần trăm không được vượt quá 100%'
      });
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    await promotion.update(updateData);

    res.json({
      success: true,
      message: 'Cập nhật chương trình khuyến mãi thành công',
      data: promotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi đã tồn tại'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật chương trình khuyến mãi',
      error: error.message
    });
  }
};

// Xóa promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await db.Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình khuyến mãi'
      });
    }

    // Check if promotion has been used
    if (promotion.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa chương trình khuyến mãi đã được sử dụng'
      });
    }

    await promotion.destroy();

    res.json({
      success: true,
      message: 'Xóa chương trình khuyến mãi thành công'
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa chương trình khuyến mãi',
      error: error.message
    });
  }
};

// Kiểm tra và áp dụng promotion code
export const validatePromotionCode = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code || !orderValue) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã khuyến mãi và giá trị đơn hàng'
      });
    }

    const promotion = await db.Promotion.findOne({
      where: { 
        code: code.toUpperCase(),
        status: 'active'
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Mã khuyến mãi không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }

    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    // Check if promotion is within valid date range
    if (now < startDate || now > endDate) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi không còn hiệu lực'
      });
    }

    // Check if promotion has reached usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Mã khuyến mãi đã hết lượt sử dụng'
      });
    }

    // Check minimum order value
    if (orderValue < promotion.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải có giá trị tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (orderValue * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
        discountAmount = promotion.maxDiscountAmount;
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    // Ensure discount doesn't exceed order value
    if (discountAmount > orderValue) {
      discountAmount = orderValue;
    }

    res.json({
      success: true,
      message: 'Mã khuyến mãi hợp lệ',
      data: {
        promotion,
        discountAmount: Math.round(discountAmount),
        finalAmount: orderValue - Math.round(discountAmount)
      }
    });
  } catch (error) {
    console.error('Error validating promotion code:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra mã khuyến mãi',
      error: error.message
    });
  }
};

// Cập nhật trạng thái promotion
export const updatePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const promotion = await db.Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương trình khuyến mãi'
      });
    }

    await promotion.update({ status });

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: promotion
    });
  } catch (error) {
    console.error('Error updating promotion status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái',
      error: error.message
    });
  }
};

// Lấy thống kê promotion
export const getPromotionStats = async (req, res) => {
  try {
    const totalPromotions = await db.Promotion.count();
    const activePromotions = await db.Promotion.count({ where: { status: 'active' } });
    const inactivePromotions = await db.Promotion.count({ where: { status: 'inactive' } });
    const expiredPromotions = await db.Promotion.count({ where: { status: 'expired' } });

    // Get promotions expiring in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const expiringSoon = await db.Promotion.count({
      where: {
        status: 'active',
        endDate: {
          [Op.lte]: sevenDaysFromNow,
          [Op.gte]: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalPromotions,
        active: activePromotions,
        inactive: inactivePromotions,
        expired: expiredPromotions,
        expiringSoon
      }
    });
  } catch (error) {
    console.error('Error getting promotion stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};
