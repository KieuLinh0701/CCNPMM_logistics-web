import db from '../models';

const { Op, fn, col } = require("sequelize");

const productService = {

  // Get Shift Enum
  async getProductTypes(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum shift từ model Employee
      const typesEnum = db.Product.rawAttributes.type.values;

      return {
        success: true,
        message: 'Lấy danh sách loại sản phẩm thành công',
        types: typesEnum,
      };
    } catch (error) {
      console.error('Get Types Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Status Enum
  async getProductStatuses(userId) {
    try {
      // Lấy User đang thực hiện
      const user = await db.User.count({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // Lấy enum shift từ model Employee
      const statusesEnum = db.Product.rawAttributes.status.values;

      return {
        success: true,
        message: 'Lấy danh trạng thái sản phẩm thành công',
        statuses: statusesEnum,
      };
    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Get Products By User 
  async listUserProducts(userId, page, limit, filters) {
    try {
      const { Op, fn, col, literal } = db.Sequelize;

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      let whereCondition = { userId };

      // Lọc dữ liệu
      const { searchText, type, status, startDate, endDate, sort, stock } = filters || {};


      if (searchText && searchText.trim()) {
        whereCondition.name = { [Op.like]: `%${searchText.trim()}%` };
      }

      if (type && type !== 'All') whereCondition.type = type;
      if (status && status !== 'All') whereCondition.status = status;

      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
      }

      // XỬ LÝ FILTER STOCK - SỬA LẠI
      if (stock && stock !== 'All') {
        switch (stock) {
          case 'inStock':
            whereCondition.stock = { [Op.gt]: 0 };
            break;
          case 'outOfStock':
            whereCondition.stock = { [Op.eq]: 0 };
            break;
          case 'lowStock':
            whereCondition.stock = {
              [Op.gt]: 0,
              [Op.lte]: 10
            };
            break;
          default:
            // Nếu stock là 'All' hoặc không hợp lệ, không filter
            break;
        }
      }

      // DEBUG: Log để kiểm tra điều kiện where
      console.log('Where condition:', JSON.stringify(whereCondition, null, 2));
      console.log('Filters received:', filters);

      // Order
      let order = [['createdAt', 'DESC']];

      if (sort && sort !== 'none') {
        switch (sort) {
          case 'newest':
            order = [['createdAt', 'DESC']];
            break;
          case 'oldest':
            order = [['createdAt', 'ASC']];
            break;
          case 'bestSelling':
            order = [['soldQuantity', 'DESC']];
            break;
          case 'leastSelling':
            order = [['soldQuantity', 'ASC']];
            break;
          case 'highestPrice':
            order = [['price', 'DESC']];
            break;
          case 'lowestPrice':
            order = [['price', 'ASC']];
            break;
          case 'highestStock':
            order = [['stock', 'DESC']];
            break;
          case 'lowestStock':
            order = [['stock', 'ASC']];
            break;
          default:
            order = [['createdAt', 'DESC']];
        }
      }

      const productsResult = await db.Product.findAndCountAll({
        where: whereCondition,
        order,
        limit: parseInt(limit) || 10,
        offset: (parseInt(page) - 1) * parseInt(limit) || 0,
      });

      // DEBUG: Log kết quả
      console.log('Products found:', productsResult.rows.length);
      console.log('Total count:', productsResult.count);

      return {
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        products: productsResult.rows,
        total: Array.isArray(productsResult.count) ? productsResult.count.length : productsResult.count,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      };
    } catch (error) {
      console.error('Get Products By User error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  async createProduct(userId, name, weight, type, status, price, stock) {
    const t = await db.sequelize.transaction();
    try {
      // ===== Validate input =====
      if (!name || !name.trim()) {
        await t.rollback();
        return { success: false, message: "Tên sản phẩm không được để trống" };
      }
      if (!weight || weight <= 0) {
        await t.rollback();
        return { success: false, message: "Trọng lượng phải lớn hơn 0" };
      }
      if (!price || price < 0) {
        await t.rollback();
        return { success: false, message: "Giá sản phẩm không hợp lệ" };
      }
      if (!type || !['Fresh', 'Letter', 'Goods'].includes(type)) {
        await t.rollback();
        return { success: false, message: "Loại sản phẩm không hợp lệ" };
      }

      // ===== Kiểm tra user =====
      const user = await db.User.findByPk(userId, { transaction: t });
      if (!user) {
        await t.rollback();
        return { success: false, message: 'Người dùng không tồn tại' };
      }

      // ===== Kiểm tra trùng tên sản phẩm (case-insensitive) =====
      const trimmedName = name.trim();

      const existingProduct = await db.Product.findOne({
        where: {
          userId,
          name: trimmedName
        },
        transaction: t
      });

      if (existingProduct) {
        await t.rollback();
        return {
          success: false,
          message: `Đã tồn tại sản phẩm "${trimmedName}" trong danh sách của bạn`
        };
      }

      // ===== Tạo sản phẩm mới =====
      const newProduct = await db.Product.create({
        name: trimmedName,
        weight: parseFloat(weight),
        status: status || "Active",
        type,
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        soldQuantity: 0,
        userId: user.id,
      }, { transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Tạo sản phẩm thành công",
        product: newProduct
      };

    } catch (error) {
      await t.rollback();
      console.error("Add Product error:", error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: `Đã tồn tại sản phẩm "${name.trim()}" trong danh sách của bạn`
        };
      }

      return { success: false, message: "Lỗi server khi tạo sản phẩm" };
    }
  },

  async updateProduct(productId, userId, name, weight, type, status, price, stock) {
    const t = await db.sequelize.transaction();
    try {
      if (!productId) return { success: false, message: "Thiếu thông tin: productId" };
      if (!name || name.trim().length === 0) {
        return { success: false, message: "Tên sản phẩm không được để trống" };
      }
      if (!weight || weight <= 0) {
        return { success: false, message: "Trọng lượng phải lớn hơn 0" };
      }
      if (!price || price < 0) {
        return { success: false, message: "Giá sản phẩm không hợp lệ" };
      }
      if (!type || !['Fresh', 'Letter', 'Goods'].includes(type)) {
        return { success: false, message: "Loại sản phẩm không hợp lệ" };
      }

      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      const product = await db.Product.findOne({
        where: { id: productId, userId: user.id },
        transaction: t
      });
      if (!product) {
        return { success: false, message: "Sản phẩm không tồn tại hoặc bạn không có quyền sửa" };
      }

      // Kiểm tra status hợp lệ
      if (!status || !['Active', 'Inactive'].includes(status)) {
        return { success: false, message: "Trạng thái sản phẩm không hợp lệ" };
      }

      // Kiểm tra tên trùng với sản phẩm khác cùng user
      const trimmedName = name.trim();
      const existingProduct = await db.Product.findOne({
        where: {
          userId,
          name: trimmedName,
          id: { [db.Sequelize.Op.ne]: productId } // không so sánh với chính sản phẩm đang update
        },
        transaction: t
      });

      if (existingProduct) {
        await t.rollback();
        return {
          success: false,
          message: `Đã tồn tại sản phẩm "${trimmedName}" trong danh sách của bạn`
        };
      }

      await product.update({
        name: trimmedName,
        weight,
        price,
        type,
        status,
        stock: parseInt(stock) || 0  // update stock
      }, { transaction: t });

      await t.commit();

      const updatedProduct = await db.Product.findOne({
        where: { id: productId },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      return {
        success: true,
        message: "Cập nhật sản phẩm thành công",
        product: updatedProduct
      };

    } catch (error) {
      await t.rollback();
      console.error("Update Product error:", error);
      return { success: false, message: "Lỗi server khi cập nhật sản phẩm" };
    }
  },

  async importProducts(userId, products) {
    const importedResults = [];
    const t = await db.sequelize.transaction();

    try {
      if (!Array.isArray(products) || products.length === 0) {
        return { success: false, message: "Không có dữ liệu sản phẩm để import" };
      }

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) {
        return { success: false, message: "Người dùng không tồn tại" };
      }

      // Tạo một set để lưu tên đã import trong file (case-insensitive)
      const namesInFile = new Set();

      for (const p of products) {
        const { name, weight, type, status, price, stock } = p;

        const trimmedName = name ? name.trim() : "";

        // Validate dữ liệu
        const missingFields = [];
        if (!trimmedName) missingFields.push("name");
        if (!weight) missingFields.push("weight");
        if (!type) missingFields.push("type");
        if (!price) missingFields.push("price");

        if (missingFields.length > 0) {
          importedResults.push({
            name: trimmedName || "(Chưa có tên)",
            success: false,
            message: `Thiếu thông tin: ${missingFields.join(", ")}`
          });
          continue;
        }

        // Kiểm tra trùng với tên trong file
        if (namesInFile.has(trimmedName.toLowerCase())) {
          importedResults.push({
            name: trimmedName,
            success: false,
            message: `Sản phẩm "${trimmedName}" bị trùng trong file import`
          });
          continue;
        }

        // Kiểm tra trùng với DB
        const existingProduct = await db.Product.findOne({
          where: {
            userId,
            name: trimmedName
          },
          transaction: t
        });

        if (existingProduct) {
          importedResults.push({
            name: trimmedName,
            success: false,
            message: `Sản phẩm "${trimmedName}" đã tồn tại trong danh sách của bạn`
          });
          continue;
        }

        try {
          // Tạo sản phẩm
          const newProduct = await db.Product.create(
            {
              name: trimmedName,
              weight,
              type,
              status: status || "Active",
              price: price || 0,
              stock: stock || 0,
              userId: user.id,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            { transaction: t }
          );

          namesInFile.add(trimmedName.toLowerCase()); // thêm vào set

          const plainProduct = newProduct.toJSON();
          plainProduct.totalSold = 0;

          importedResults.push({
            name: trimmedName,
            success: true,
            message: "Thêm sản phẩm thành công",
            product: plainProduct,
          });
        } catch (err) {
          console.error(`Import product "${trimmedName}" error:`, err);
          importedResults.push({
            name: trimmedName,
            success: false,
            message: "Lỗi server khi thêm sản phẩm",
          });
        }
      }

      await t.commit();

      // Phân loại kết quả
      const createdProducts = importedResults.filter(r => r.success).map(r => r.name);
      const failedProducts = importedResults.filter(r => !r.success).map(r => ({ name: r.name, message: r.message }));

      return {
        success: true,
        message: `Import hoàn tất: ${createdProducts.length} sản phẩm mới, ${failedProducts.length} lỗi`,
        totalImported: createdProducts.length,
        totalFailed: failedProducts.length,
        createdProducts,
        failedProducts,
        results: importedResults,
      };
    } catch (error) {
      await t.rollback();
      console.error("Import Products error:", error);
      return { success: false, message: "Lỗi server khi import sản phẩm" };
    }
  },

  // Get Active Products By User 
  async listActiveUserProducts(userId, limit = 10, filters = {}) {
    try {
      const { Op } = db.Sequelize;
      const { searchText, lastId } = filters;

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Điều kiện where chỉ lấy sản phẩm active
      let whereCondition = {
        userId,
        status: 'Active',
        stock: {
          [db.Sequelize.Op.gt]: 0
        }
      };

      if (searchText) {
        whereCondition.name = { [Op.like]: `%${searchText}%` };
      }

      if (lastId) {
        // Chỉ lấy sản phẩm có id nhỏ hơn lastId (load tiếp theo)
        whereCondition.id = { [Op.lt]: lastId };
      }

      // Lấy dữ liệu
      const products = await db.Product.findAll({
        where: whereCondition,
        order: [['id', 'DESC']],
        limit,
      });

      return {
        success: true,
        message: 'Lấy danh sách sản phẩm active thành công',
        products,
        nextCursor: products.length > 0 ? products[products.length - 1].id : null,
      };
    } catch (error) {
      console.error('Get Active Products By User error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // List products with pagination and search (from origin/dat)
  async list(params) {
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

        return {
          success: true,
          data: searchRows,
          pagination: { page: Number(page), limit: Number(limit), total: searchCount }
        };
      }

      return {
        success: true,
        data: rows,
        pagination: { page: Number(page), limit: Number(limit), total: count }
      };
    } catch (error) {
      console.error('List Products error:', error);
      return { success: false, message: 'Lỗi server khi lấy danh sách sản phẩm' };
    }
  },

  // Get product by ID (from origin/dat)
  async getById(productId) {
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
        return { success: false, message: "Không tìm thấy sản phẩm" };
      }
      return { success: true, data: product };
    } catch (error) {
      console.error('Get Product By ID error:', error);
      return { success: false, message: "Lỗi server khi lấy chi tiết sản phẩm" };
    }
  },

  // Create new product (from origin/dat)
  async create(productData) {
    const t = await db.sequelize.transaction();
    try {
      const { userId, name, weight, type, status = "Active" } = productData;

      if (!userId || !name || !weight || !type) {
        return { success: false, message: "Thiếu thông tin bắt buộc" };
      }

      // Check if user exists
      const user = await db.User.findByPk(userId);
      if (!user) {
        return { success: false, message: "Không tìm thấy người dùng" };
      }

      // Validate weight
      if (weight <= 0) {
        return { success: false, message: "Trọng lượng phải lớn hơn 0" };
      }

      const created = await db.Product.create({
        userId, name, weight, type, status
      }, { transaction: t });

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

      await t.commit();
      return { success: true, data: newProduct };
    } catch (error) {
      await t.rollback();
      console.error('Create Product error:', error);
      return { success: false, message: "Lỗi server khi tạo sản phẩm" };
    }
  },

  // Update product (from origin/dat)
  async update(productId, updateData) {
    const t = await db.sequelize.transaction();
    try {
      const { name, weight, type, status } = updateData;

      const product = await db.Product.findByPk(productId);
      if (!product) {
        return { success: false, message: "Không tìm thấy sản phẩm" };
      }

      // Validate weight if provided
      if (weight !== undefined && weight <= 0) {
        return { success: false, message: "Trọng lượng phải lớn hơn 0" };
      }

      // Update fields
      if (typeof name !== "undefined") product.name = name;
      if (typeof weight !== "undefined") product.weight = weight;
      if (typeof type !== "undefined") product.type = type;
      if (typeof status !== "undefined") product.status = status;

      await product.save({ transaction: t });

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

      await t.commit();
      return { success: true, data: updatedProduct };
    } catch (error) {
      await t.rollback();
      console.error('Update Product error:', error);
      return { success: false, message: "Lỗi server khi cập nhật sản phẩm" };
    }
  },

  // Delete product (from origin/dat)
  async remove(productId) {
    const t = await db.sequelize.transaction();
    try {
      const product = await db.Product.findByPk(productId);
      if (!product) {
        return { success: false, message: "Không tìm thấy sản phẩm" };
      }

      // Check if product is used in any orders
      const orderProductCount = await db.OrderProduct.count({ where: { productId } });
      if (orderProductCount > 0) {
        return { success: false, message: "Không thể xóa sản phẩm đã được sử dụng trong đơn hàng" };
      }

      await product.destroy({ transaction: t });
      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      console.error('Delete Product error:', error);
      return { success: false, message: "Lỗi server khi xóa sản phẩm" };
    }
  }
};

export default productService;