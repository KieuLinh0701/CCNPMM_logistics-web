import db from '../models/index.js';
import { Op } from 'sequelize';

// Service để xử lý logic promotion
export class PromotionService {
  
  // Tạo promotion mới
  static async createPromotion(promotionData) {
    try {
      // Validate data
      const validation = this.validatePromotionData(promotionData);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Create promotion
      const promotion = await db.Promotion.create({
        ...promotionData,
        code: promotionData.code.toUpperCase()
      });

      return {
        success: true,
        data: promotion
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate promotion data
  static validatePromotionData(data) {
    const { code, discountType, discountValue, startDate, endDate } = data;

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return {
        isValid: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      };
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return {
        isValid: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      };
    }

    // Validate discount value
    if (discountValue <= 0) {
      return {
        isValid: false,
        message: 'Giá trị giảm phải lớn hơn 0'
      };
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountValue > 100) {
      return {
        isValid: false,
        message: 'Giảm giá phần trăm không được vượt quá 100%'
      };
    }

    return { isValid: true };
  }

  // Kiểm tra và tính toán discount
  static async calculateDiscount(code, orderValue) {
    try {
      const promotion = await db.Promotion.findOne({
        where: { 
          code: code.toUpperCase(),
          status: 'active'
        }
      });

      if (!promotion) {
        return {
          success: false,
          message: 'Mã khuyến mãi không tồn tại hoặc đã bị vô hiệu hóa'
        };
      }

      // Check date validity
      const now = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);

      if (now < startDate || now > endDate) {
        return {
          success: false,
          message: 'Mã khuyến mãi không còn hiệu lực'
        };
      }

      // Check usage limit
      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        return {
          success: false,
          message: 'Mã khuyến mãi đã hết lượt sử dụng'
        };
      }

      // Check minimum order value
      if (orderValue < promotion.minOrderValue) {
        return {
          success: false,
          message: `Đơn hàng phải có giá trị tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này`
        };
      }

      // Calculate discount
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

      return {
        success: true,
        data: {
          promotion,
          discountAmount: Math.round(discountAmount),
          finalAmount: orderValue - Math.round(discountAmount)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Áp dụng promotion (tăng usedCount)
  static async applyPromotion(promotionId) {
    try {
      const promotion = await db.Promotion.findByPk(promotionId);
      
      if (!promotion) {
        throw new Error('Không tìm thấy chương trình khuyến mãi');
      }

      // Check if still available
      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        throw new Error('Mã khuyến mãi đã hết lượt sử dụng');
      }

      // Increment used count
      await promotion.increment('usedCount');

      return {
        success: true,
        data: promotion
      };
    } catch (error) {
      throw error;
    }
  }

  // Hủy áp dụng promotion (giảm usedCount)
  static async cancelPromotion(promotionId) {
    try {
      const promotion = await db.Promotion.findByPk(promotionId);
      
      if (!promotion) {
        throw new Error('Không tìm thấy chương trình khuyến mãi');
      }

      // Decrement used count (but not below 0)
      if (promotion.usedCount > 0) {
        await promotion.decrement('usedCount');
      }

      return {
        success: true,
        data: promotion
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái promotion dựa trên thời gian
  static async updatePromotionStatus() {
    try {
      const now = new Date();

      // Set expired promotions
      await db.Promotion.update(
        { status: 'expired' },
        {
          where: {
            status: 'active',
            endDate: { [Op.lt]: now }
          }
        }
      );

      // Set active promotions that are within date range
      await db.Promotion.update(
        { status: 'active' },
        {
          where: {
            status: 'inactive',
            startDate: { [Op.lte]: now },
            endDate: { [Op.gte]: now }
          }
        }
      );

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Lấy promotion sắp hết hạn
  static async getExpiringPromotions(days = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const promotions = await db.Promotion.findAll({
        where: {
          status: 'active',
          endDate: {
            [Op.lte]: futureDate,
            [Op.gte]: new Date()
          }
        },
        order: [['endDate', 'ASC']]
      });

      return {
        success: true,
        data: promotions
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê promotion
  static async getPromotionStats() {
    try {
      const total = await db.Promotion.count();
      const active = await db.Promotion.count({ where: { status: 'active' } });
      const inactive = await db.Promotion.count({ where: { status: 'inactive' } });
      const expired = await db.Promotion.count({ where: { status: 'expired' } });

      // Most used promotions
      const mostUsed = await db.Promotion.findAll({
        where: { usedCount: { [Op.gt]: 0 } },
        order: [['usedCount', 'DESC']],
        limit: 5
      });

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          expired,
          mostUsed
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
