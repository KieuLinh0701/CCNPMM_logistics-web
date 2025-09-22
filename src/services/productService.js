import db from '../models/index.js';

// List products with pagination and search
const listProducts = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "", userId, type, status } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (userId) {
        where.userId = userId;
      }
      
      if (type) {
        where.type = type;
      }
      
      if (status) {
        where.status = status;
      }
      
      const { rows, count } = await db.Product.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
            where: search ? {
              [db.Sequelize.Op.or]: [
                { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
                { email: { [db.Sequelize.Op.like]: `%${search}%` } },
              ]
            } : undefined
          }
        ]
      });
      
      // If search is provided and no user filter, search in product name
      if (search && !userId) {
        const searchWhere = {
          [db.Sequelize.Op.or]: [
            { name: { [db.Sequelize.Op.like]: `%${search}%` } }
          ]
        };
        
        if (type) searchWhere.type = type;
        if (status) searchWhere.status = status;
        
        const { rows: searchRows, count: searchCount } = await db.Product.findAndCountAll({ 
          where: searchWhere, 
          limit: Number(limit), 
          offset, 
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
            }
          ]
        });
        
        resolve({
          success: true,
          data: searchRows,
          pagination: { page: Number(page), limit: Number(limit), total: searchCount }
        });
        return;
      }
      
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

// Get product by ID
const getProductById = async (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Product.findByPk(productId, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role']
          }
        ]
      });
      
      if (!product) {
        resolve({ success: false, message: "Không tìm thấy sản phẩm" });
        return;
      }
      resolve({ success: true, data: product });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new product
const createProduct = async (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId, name, weight, type, status = "Active" } = productData;
      
      if (!userId || !name || !weight || !type) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      // Check if user exists
      const user = await db.User.findByPk(userId);
      if (!user) {
        resolve({ success: false, message: "Không tìm thấy người dùng" });
        return;
      }
      
      // Validate weight
      if (weight <= 0) {
        resolve({ success: false, message: "Trọng lượng phải lớn hơn 0" });
        return;
      }
      
      const created = await db.Product.create({ 
        userId, name, weight, type, status
      });
      
      // Fetch the created product with includes
      const newProduct = await db.Product.findByPk(created.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
          }
        ]
      });
      
      resolve({ success: true, data: newProduct });
    } catch (error) {
      reject(error);
    }
  });
};

// Update product
const updateProduct = async (productId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, weight, type, status } = updateData;
      
      const product = await db.Product.findByPk(productId);
      if (!product) {
        resolve({ success: false, message: "Không tìm thấy sản phẩm" });
        return;
      }
      
      // Validate weight if provided
      if (weight !== undefined && weight <= 0) {
        resolve({ success: false, message: "Trọng lượng phải lớn hơn 0" });
        return;
      }
      
      // Update fields
      if (typeof name !== "undefined") product.name = name;
      if (typeof weight !== "undefined") product.weight = weight;
      if (typeof type !== "undefined") product.type = type;
      if (typeof status !== "undefined") product.status = status;
      
      await product.save();
      
      // Fetch updated product with includes
      const updatedProduct = await db.Product.findByPk(product.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
          }
        ]
      });
      
      resolve({ success: true, data: updatedProduct });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete product
const deleteProduct = async (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        resolve({ success: false, message: "Không tìm thấy sản phẩm" });
        return;
      }
      
      // Check if product is used in any orders
      const orderProductCount = await db.OrderProduct.count({ where: { productId } });
      if (orderProductCount > 0) {
        resolve({ success: false, message: "Không thể xóa sản phẩm đã được sử dụng trong đơn hàng" });
        return;
      }
      
      await product.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
