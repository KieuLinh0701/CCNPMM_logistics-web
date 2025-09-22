import db from '../models/index.js';

// List orders with pagination, search and filters
const listOrders = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "", status, fromOfficeId, toOfficeId, userId, serviceTypeId } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (search) {
        where[db.Sequelize.Op.or] = [
          { trackingNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
          { senderName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { senderPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
          { recipientPhone: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }
      
      if (status) {
        where.status = status;
      }
      
      if (fromOfficeId) {
        where.fromOfficeId = fromOfficeId;
      }
      
      if (toOfficeId) {
        where.toOfficeId = toOfficeId;
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      if (serviceTypeId) {
        where.serviceTypeId = serviceTypeId;
      }
      
      const { rows, count } = await db.Order.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
          },
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name', 'address', 'type']
          },
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'address', 'type']
          },
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime']
          },
          {
            model: db.Product,
            as: 'products',
            attributes: ['id', 'name', 'weight', 'type'],
            through: { attributes: ['quantity'] }
          }
        ]
      });
      
      resolve({
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get order by ID
const getOrderById = async (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await db.Order.findByPk(orderId, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          },
          {
            model: db.Office,
            as: 'fromOffice',
            attributes: ['id', 'name', 'address', 'phoneNumber', 'type', 'status']
          },
          {
            model: db.Office,
            as: 'toOffice',
            attributes: ['id', 'name', 'address', 'phoneNumber', 'type', 'status']
          },
          {
            model: db.ServiceType,
            as: 'serviceType',
            attributes: ['id', 'name', 'deliveryTime', 'status']
          },
          {
            model: db.Product,
            as: 'products',
            attributes: ['id', 'name', 'weight', 'type', 'status'],
            through: { attributes: ['quantity'] }
          },
          {
            model: db.OrderHistory,
            as: 'histories',
            attributes: ['id', 'status', 'notes', 'createdAt'],
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      
      if (!order) {
        resolve({ success: false, message: "Không tìm thấy đơn hàng" });
        return;
      }
      resolve({ success: true, data: order });
    } catch (error) {
      reject(error);
    }
  });
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        resolve({ success: false, message: "Không tìm thấy đơn hàng" });
        return;
      }
      
      order.status = status;
      await order.save();
      
      resolve({ success: true, data: order });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete order
const deleteOrder = async (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await db.Order.findByPk(orderId);
      if (!order) {
        resolve({ success: false, message: "Không tìm thấy đơn hàng" });
        return;
      }
      
      await order.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};

