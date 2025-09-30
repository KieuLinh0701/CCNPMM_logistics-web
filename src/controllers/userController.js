import userService from "../services/userService.js";

const userController = {
  async list(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await userService.listUsers({ page, limit, search });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await userService.getUserById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await userService.createUser(req.body);
      if (!result.success) {
        const statusCode = result.message === "Email đã tồn tại" ? 409 : 400;
        return res.status(statusCode).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await userService.updateUser(req.params.id, req.body);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default userController;



