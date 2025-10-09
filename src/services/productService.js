import db from '../models';

const productService = {
  // Hàm tính totalSold cho 1 sản phẩm
  async getTotalSold(productId) {
    try {
      const { count } = await db.OrderProduct.findAndCountAll({
        where: { productId }
      });
      return count;
    } catch (error) {
      console.error(`Get totalSold error for product ${productId}:`, error);
      return 0; // Nếu lỗi thì trả về 0 để tránh crash
    }
  },

  // Get Shift Enum
  async getTypesEnum(userId) {
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
  async getStatusesEnum(userId) {
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
  async getProductsByUser(userId, page, limit, filters) {
    try {
      const { Op, fn, col, literal } = db.Sequelize;

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      let whereCondition = { userId };

      // Lọc dữ liệu
      const { searchText, type, status, startDate, endDate, sort, stockFilter } = filters || {};

      if (searchText) {
        whereCondition.name = { [Op.like]: `%${searchText}%` };
      }
      if (type && type !== 'All') whereCondition.type = type;
      if (status && status !== 'All') whereCondition.status = status;
      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
      }

      // Order
      let order = [['id', 'DESC']];

      if (sort != 'none') {
        if (sort === 'bestSelling') {
          order = [['soldQuantity', 'DESC']];
        } else if (sort === 'leastSelling') {
          order = [['soldQuantity', 'ASC']];
        } else if (sort === 'highestPrice') {
          order = [['price', 'DESC']];
        } else if (sort === 'lowestPrice') {
          order = [['price', 'ASC']];
        } else if (sort === 'highestStock') {
          order = [['stock', 'DESC']];
        } else if (sort === 'lowestStock') {
          order = [['stock', 'ASC']];
        }
      }

      if (stockFilter && stockFilter !== 'All') {
        switch (stockFilter) {
          case 'inStock':
            whereCondition.stock = { [Op.gt]: 0 };
            break;
          case 'outOfStock':
            whereCondition.stock = 0;
            break;
          case 'lowStock':
            whereCondition.stock = {
              [Op.gt]: 0,
              [Op.lte]: 10
            };
            break;
          default:
            break;
        }
      }

      const productsResult = await db.Product.findAndCountAll({
        where: whereCondition,
        order,
        limit,
        offset: (page - 1) * limit,
      });

      return {
        success: true,
        message: 'Lấy danh sách sản phẩm thành công',
        products: productsResult.rows,
        total: Array.isArray(productsResult.count) ? productsResult.count.length : productsResult.count,
        page,
        limit,
      };
    } catch (error) {
      console.error('Get Products By User error:', error);
      return { success: false, message: 'Lỗi server' };
    }
  },

  // Add Product
  async addProduct(userId, name, weight, type, status, price, stock) {
    const t = await db.sequelize.transaction();
    try {
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

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Tạo sản phẩm mới
      const newProduct = await db.Product.create({
        name: name.trim(),
        weight: parseFloat(weight),
        status: status || "Active",
        type: type,
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        userId: user.id,
      }, { transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Tạo sản phẩm thành công",
        product: newProduct,
      };
    } catch (error) {
      await t.rollback();
      console.error("Add Product error:", error);
      return { success: false, message: "Lỗi server khi tạo sản phẩm" };
    }
  },

  // Update Product
  async updateProduct(productId, userId, name, weight, type, status, price) {
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
        where: {
          id: productId,
          userId: user.id
        }
      });
      if (!product) {
        return { success: false, message: "Sản phẩm không tồn tại hoặc bạn không có quyền sửa" };
      }

      // THIẾU: Kiểm tra status hợp lệ
      if (!status || !['Active', 'Inactive'].includes(status)) {
        return { success: false, message: "Trạng thái sản phẩm không hợp lệ" };
      }

      await product.update({
        name: name.trim(),
        weight,
        price,
        type,
        status
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

  // Import Products
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

      for (const p of products) {
        const { name, weight, type, status, price, stock } = p;

        // Validate dữ liệu
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!weight) missingFields.push("weight");
        if (!type) missingFields.push("type");
        if (!price) missingFields.push("price");

        if (missingFields.length > 0) {
          importedResults.push({
            name: name || "(Chưa có tên)",
            success: false,
            message: `Thiếu thông tin: ${missingFields.join(", ")}`
          });
          continue;
        }

        try {
          // Tạo sản phẩm
          const newProduct = await db.Product.create(
            {
              name,
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

          const plainProduct = newProduct.toJSON();
          plainProduct.totalSold = 0;

          importedResults.push({
            name,
            success: true,
            message: "Thêm sản phẩm thành công",
            product: plainProduct,
          });
        } catch (err) {
          console.error(`Import product "${name}" error:`, err);
          importedResults.push({
            name,
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
  async getActiveProductsByUser(userId, limit = 10, filters = {}) {
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

};

export default productService;