import productService from "../services/productService.js";

const productController = {
  // Get Types Enum
  async getProductTypes(req, res) {
    try {
      const userId = req.user.id;
      const result = await productService.getProductTypes(userId);
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
  async getProductStatuses(req, res) {
    try {
      const userId = req.user.id;
      const result = await productService.getProductStatuses(userId);
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
  async listUserProducts(req, res) {
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
        stock: req.query.stock || undefined,
      };

      const result = await productService.listUserProducts(userId, page, limit, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Products By User error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Add Product 
  async createProduct(req, res) {
    try {
      const userId = req.user.id;
      const { name, weight, type, status, price, stock } = req.body;

      const result = await productService.createProduct(userId, name, weight, type, status, price, stock);
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
      const { name, weight, type, status, price, stock } = req.body;

      const result = await productService.updateProduct(id, userId, name, weight, type, status, price, stock);
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
      return res.status(200).json(result);
    } catch (error) {
      console.error("Import Products error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi import sản phẩm",
      });
    }
  },

  // Get Active Products By User
  async listActiveUserProducts(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        lastId: req.query.lastId ? parseInt(req.query.lastId) : undefined,
      };

      const result = await productService.listActiveUserProducts(userId, limit, filters);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Active Products By User error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // List products (phục vụ admin)
  async list(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await productService.list({ page, limit, search });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get product by ID
  async getById(req, res) {
    try {
      const result = await productService.getById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create product
  async create(req, res) {
    try {
      const result = await productService.create(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update product (for admin)
  async update(req, res) {
    try {
      const result = await productService.update(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Remove product
  async remove(req, res) {
    try {
      const result = await productService.remove(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default productController;