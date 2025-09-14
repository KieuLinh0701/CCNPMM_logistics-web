import db from "../models/index.js";
import bcrypt from "bcryptjs";

const sanitizeUser = (userInstance) => {
  if (!userInstance) return null;
  const { id, email, firstName, lastName, phoneNumber, role, isVerified, isActive, lastLoginAt, createdAt, updatedAt } = userInstance;
  return { id, email, firstName, lastName, phoneNumber, role, isVerified, isActive, lastLoginAt, createdAt, updatedAt };
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
      where[db.Sequelize.Op.or] = [
        { email: { [db.Sequelize.Op.like]: `%${search}%` } },
        { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
        { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
        { phoneNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await db.User.findAndCountAll({ where, limit: Number(limit), offset, order: [["createdAt", "DESC"]] });
    return res.json({ success: true, data: rows.map(sanitizeUser), pagination: { page: Number(page), limit: Number(limit), total: count } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role = "staff", isActive = true } = req.body;
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }
    const exists = await db.User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: "Email đã tồn tại" });
    const hashed = await bcrypt.hash(password, 10);
    const created = await db.User.create({ email, password: hashed, firstName, lastName, phoneNumber, role, isActive });
    return res.status(201).json({ success: true, data: sanitizeUser(created) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, role, isActive, password } = req.body;
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    if (typeof firstName !== "undefined") user.firstName = firstName;
    if (typeof lastName !== "undefined") user.lastName = lastName;
    if (typeof phoneNumber !== "undefined") user.phoneNumber = phoneNumber;
    if (typeof role !== "undefined") user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;
    if (typeof password === "string" && password.length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    await user.destroy();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove };
