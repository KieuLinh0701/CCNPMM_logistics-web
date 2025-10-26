import bankAccountService from '../services/bankAccountService.js';

const bankAccountController = {
  async list(req, res) {
    const userId = req.user.id;
    const result = await bankAccountService.list(userId);
    return res.status(result.success ? 200 : 400).json(result);
  },

  async add(req, res) {
    const userId = req.user.id;
    const payload = req.body;
    const result = await bankAccountService.add(userId, payload);
    return res.status(result.success ? 201 : 400).json(result);
  },

  async update(req, res) {
    const userId = req.user.id;
    const accountId = req.params.id;
    const payload = req.body;
    const result = await bankAccountService.update(userId, accountId, payload);
    return res.status(result.success ? 200 : 400).json(result);
  },

  async remove(req, res) {
    const userId = req.user.id;
    const accountId = req.params.id;
    const result = await bankAccountService.remove(userId, accountId);
    return res.status(result.success ? 200 : 400).json(result);
  },

  async setDefault(req, res) {
    const userId = req.user.id;
    const accountId = req.params.id;
    console.log("userId", req.user.id, "accountId", req.params.id);
    const result = await bankAccountService.setDefault(userId, accountId);
    return res.status(result.success ? 200 : 400).json(result);
  },
};

export default bankAccountController;