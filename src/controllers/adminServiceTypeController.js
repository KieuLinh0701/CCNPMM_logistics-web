import db from "../models/index.js";

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.like]: `%${search}%` } },
        { deliveryTime: { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await db.ServiceType.findAndCountAll({ 
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
    const serviceType = await db.ServiceType.findByPk(req.params.id);
    if (!serviceType) return res.status(404).json({ success: false, message: "Không tìm thấy loại dịch vụ" });
    return res.json({ success: true, data: serviceType });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, basePrice, codFee, weightLimit, deliveryTime, status = "active" } = req.body;
    if (!name || !basePrice || !deliveryTime) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }
    const created = await db.ServiceType.create({ 
      name, 
      basePrice: parseFloat(basePrice), 
      codFee: parseFloat(codFee || 0), 
      weightLimit: parseFloat(weightLimit || 0), 
      deliveryTime, 
      status 
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, basePrice, codFee, weightLimit, deliveryTime, status } = req.body;
    const serviceType = await db.ServiceType.findByPk(req.params.id);
    if (!serviceType) return res.status(404).json({ success: false, message: "Không tìm thấy loại dịch vụ" });
    
    if (typeof name !== "undefined") serviceType.name = name;
    if (typeof basePrice !== "undefined") serviceType.basePrice = parseFloat(basePrice);
    if (typeof codFee !== "undefined") serviceType.codFee = parseFloat(codFee);
    if (typeof weightLimit !== "undefined") serviceType.weightLimit = parseFloat(weightLimit);
    if (typeof deliveryTime !== "undefined") serviceType.deliveryTime = deliveryTime;
    if (typeof status !== "undefined") serviceType.status = status;
    
    await serviceType.save();
    return res.json({ success: true, data: serviceType });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const serviceType = await db.ServiceType.findByPk(req.params.id);
    if (!serviceType) return res.status(404).json({ success: false, message: "Không tìm thấy loại dịch vụ" });
    await serviceType.destroy();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, create, update, remove };
