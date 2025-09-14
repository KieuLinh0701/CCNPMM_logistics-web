import db from "../models/index.js";

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status, postOfficeId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {};
    
    if (search) {
      where[db.Sequelize.Op.or] = [
        { trackingNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
        { senderName: { [db.Sequelize.Op.like]: `%${search}%` } },
        { receiverName: { [db.Sequelize.Op.like]: `%${search}%` } },
        { senderPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
        { receiverPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (postOfficeId) {
      where.postOfficeId = postOfficeId;
    }
    
    const { rows, count } = await db.Order.findAndCountAll({ 
      where, 
      limit: Number(limit), 
      offset, 
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.PostOffice,
          as: 'postOffice',
          attributes: ['id', 'name', 'address']
        },
        {
          model: db.ServiceType,
          as: 'serviceType',
          attributes: ['id', 'name', 'basePrice', 'deliveryTime']
        }
      ]
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
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        {
          model: db.PostOffice,
          as: 'postOffice',
          attributes: ['id', 'name', 'address', 'phone']
        },
        {
          model: db.ServiceType,
          as: 'serviceType',
          attributes: ['id', 'name', 'basePrice', 'codFee', 'deliveryTime']
        }
      ]
    });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await db.Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    
    order.status = status;
    await order.save();
    
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    await order.destroy();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { list, getById, updateStatus, remove };
