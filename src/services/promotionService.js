import db from '../models';
import { Op } from 'sequelize';

const promotionService = {
  // Get Promotion Active (phân trang với searchText, lastId, nextCursor)
  async getActivePromotions({ limit = 10, filters = {} }) {
    try {
      const now = new Date();
      const { searchText, lastId, shippingFee} = filters; // 👈 unpack trong service

      // Điều kiện where cơ bản
      let whereCondition = {
        [Op.and]: [
          { status: 'active' },
          { startDate: { [Op.lte]: now } },
          { endDate: { [Op.gte]: now } },
          { minOrderValue: { [Op.lte]: shippingFee } },
        ],
      };

      // Nếu có searchText
      if (searchText) {
        whereCondition[Op.and].push({
          [Op.or]: [
            { code: { [Op.like]: `%${searchText}%` } },
            { description: { [Op.like]: `%${searchText}%` } },
          ],
        });
      }

      // Nếu có lastId (cursor pagination)
      if (lastId) {
        whereCondition[Op.and].push({ id: { [Op.lt]: lastId } });
      }

      // Lấy danh sách khuyến mãi
      const promotions = await db.Promotion.findAll({
        where: whereCondition,
        order: [['id', 'DESC']], // đảm bảo phân trang đúng
        limit,
      });

      // Lọc theo usageLimit
      const applicablePromotions = promotions.filter((promo) => {
        if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
          return false;
        }
        return true;
      });

      return {
        success: true,
        message: 'Lấy danh sách chương trình khuyến mãi thành công',
        promotions: applicablePromotions,
        nextCursor:
          applicablePromotions.length > 0
            ? applicablePromotions[applicablePromotions.length - 1].id
            : null,
      };
    } catch (error) {
      console.error('Get Active Promotions error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },
};

export default promotionService;