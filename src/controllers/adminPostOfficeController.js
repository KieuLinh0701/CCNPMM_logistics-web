import db from "../models/index.js";

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.like]: `%${search}%` } },
        { address: { [db.Sequelize.Op.like]: `%${search}%` } },
        { phone: { [db.Sequelize.Op.like]: `%${search}%` } },
        { area: { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await db.PostOffice.findAndCountAll({ 
      where, 
      limit: Number(limit), 
      offset, 
      order: [["createdAt", "DESC"]] 
    });
    return res.json({ 
      success: true, 
      data: rows, 
      pagination: { page: Number(page), limit: Number(limit), total: count } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const postOffice = await db.PostOffice.findByPk(req.params.id);
    if (!postOffice) return res.status(404).json({ success: false, message: "Không tìm thấy bưu cục" });
    return res.json({ success: true, data: postOffice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, address, phone, workingHours, area, status = "active" } = req.body;
    if (!name || !address || !phone || !area) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }
    const created = await db.PostOffice.create({ name, address, phone, workingHours, area, status });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, address, phone, workingHours, area, status } = req.body;
    const postOffice = await db.PostOffice.findByPk(req.params.id);
    if (!postOffice) return res.status(404).json({ success: false, message: "Không tìm thấy bưu cục" });
    
    if (typeof name !== "undefined") postOffice.name = name;
    if (typeof address !== "undefined") postOffice.address = address;
    if (typeof phone !== "undefined") postOffice.phone = phone;
    if (typeof workingHours !== "undefined") postOffice.workingHours = workingHours;
    if (typeof area !== "undefined") postOffice.area = area;
    if (typeof status !== "undefined") postOffice.status = status;
    
    await postOffice.save();
    return res.json({ success: true, data: postOffice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const postOffice = await db.PostOffice.findByPk(req.params.id);
    if (!postOffice) return res.status(404).json({ success: false, message: "Không tìm thấy bưu cục" });
    await postOffice.destroy();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove };
