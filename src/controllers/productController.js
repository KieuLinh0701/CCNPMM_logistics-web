import productService from "../services/productService.js";

const productController = {
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

  async getById(req, res) {
    try {
      const result = await productService.getById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await productService.create(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await productService.update(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

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



