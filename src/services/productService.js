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
      const { searchText, type, status, startDate, endDate, sort } = filters || {};

      if (searchText) {
        whereCondition.name = { [Op.like]: `%${searchText}%` };
      }
      if (type && type !== 'All') whereCondition.type = type;
      if (status && status !== 'All') whereCondition.status = status;
      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [startDate, endDate] };
      }

      // Order
      let order = [['id', 'ASC']];
      if (sort === 'bestSelling' || sort === 'leastSelling') {
        order = [
          [
            literal(
              '(SELECT COUNT(*) FROM "OrderProducts" WHERE "OrderProducts"."productId" = "Product"."id")'
            ),
            sort === 'bestSelling' ? 'DESC' : 'ASC',
          ],
        ];
      } 

      // --- Lấy dữ liệu + đếm tổng chuẩn ---
      const productsResult = await db.Product.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: db.Order,
            as: 'orders',
            attributes: [],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [[fn('COUNT', col('orders.id')), 'totalSold']],
        },
        group: ['Product.id'],
        order, // order theo sort
        limit,
        offset: (page - 1) * limit,
        subQuery: false,
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
  async addProduct(userId, name, weight, type, status) {
    const t = await db.sequelize.transaction();
    try {
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!weight) missingFields.push("weight");
      if (!type) missingFields.push("type");

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Thiếu thông tin: ${missingFields.join(", ")}`
        };
      }

      // Kiểm tra user
      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      // Tạo sản phẩm mới
      const newProduct = await db.Product.create({
        name: name,
        weight: weight,
        status: status || "Active",
        type: type,
        userId: user.id,
      }, { transaction: t });

      const plainProduct = newProduct.toJSON();
      plainProduct.totalSold = 0;

      await t.commit();

      return {
        success: true,
        message: "Tạo sản phẩm thành công",
        product: plainProduct,
      };
    } catch (error) {
      await t.rollback();
      console.error("Add Product error:", error);
      return { success: false, message: "Lỗi server khi tạo sản phẩm" };
    }
  },

  // Update Product
  async updateProduct(productId, userId, name, weight, type, status) {
    const t = await db.sequelize.transaction();
    try {
      if (!productId) return { success: false, message: "Thiếu thông tin: productId" };

      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!weight) missingFields.push("weight");
      if (!type) missingFields.push("type");
      if (missingFields.length > 0)
        return { success: false, message: `Thiếu thông tin: ${missingFields.join(", ")}` };

      const user = await db.User.findOne({ where: { id: userId } });
      if (!user) return { success: false, message: 'Người dùng không tồn tại' };

      const product = await db.Product.findOne({ where: { id: productId, userId: user.id } });
      if (!product)
        return { success: false, message: "Sản phẩm không tồn tại hoặc bạn không có quyền sửa" };

      await product.update({ name, weight, type, status }, { transaction: t });

      const plainProduct = product.toJSON();
      plainProduct.totalSold = await this.getTotalSold(product.id);

      await t.commit();
      return { success: true, message: "Cập nhật sản phẩm thành công", product: plainProduct };
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
        const { name, weight, type, status } = p;

        // Validate dữ liệu
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!weight) missingFields.push("weight");
        if (!type) missingFields.push("type");

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

};

export default productService;