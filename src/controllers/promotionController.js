import promotionService from '../services/promotionService.js';

const promotionController = {
  // Get Promotion Active
  async getActivePromotions(req, res) {
    try {

      const limit = parseInt(req.query.limit) || 10;

      console.log("API query params:", req.query);

      const filters = {
        searchText: req.query.search || undefined,
        lastId: req.query.lastId ? parseInt(req.query.lastId) : undefined,
        shippingFee: req.query.shippingFee ? parseInt(req.query.shippingFee) : 0,
      };

      const result = await promotionService.getActivePromotions({limit, filters});

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Active Promotions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
      });
    }
  },
};

export default promotionController;