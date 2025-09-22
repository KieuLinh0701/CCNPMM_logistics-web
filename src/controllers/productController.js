import productService from "../services/productService";

const productController = {
  // Get Shift Enum
  async getTypesEnum(req, res) {
    try {

        const userId = req.user.id;

        const result = await productService.getTypesEnum(userId);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Get Types Enum error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
      });
    }
  },

  // Get Statuses Enum
  async getStatusesEnum(req, res) {
    try {

        const userId = req.user.id;

        const result = await productService.getStatusesEnum(userId);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Get Statuses Enum error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
      });
    }
  },

  // Get Product By User
  async getProductsByUser(req, res) {
    try {
      const userId = req.user.id;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        type: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await productService.getProductsByUser(userId, page, limit, filters);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Products By error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Add Product 
  async addProduct(req, res) {
    try {
      const userId = req.user.id;

      const { name, weight, type, status } = req.body;

      const result = await productService.addProduct(userId, name, weight, type, status);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Update Product 
  async updateProduct(req, res) {
    try {
      const userId = req.user.id;

      const { id } = req.params;

      const { name, weight, type, status } = req.body;

      const result = await productService.updateProduct(id, userId, name, weight, type, status);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update Product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Import Add Products
  async importProducts(req, res) {
    try {
      const userId = req.user.id;
      
      const { products } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có dữ liệu sản phẩm để import",
        });
      }

      const result = await productService.importProducts(userId, products);

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Import Products error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi import sản phẩm",
      });
    }
  },
};

export default productController;
