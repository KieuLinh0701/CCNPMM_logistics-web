'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa các trường không còn sử dụng trong bảng Products
    await queryInterface.removeColumn('Products', 'price');
    await queryInterface.removeColumn('Products', 'stock');
    await queryInterface.removeColumn('Products', 'soldQuantity');
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục các trường đã xóa
    await queryInterface.addColumn('Products', 'price', {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Giá sản phẩm'
    });
    
    await queryInterface.addColumn('Products', 'stock', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Số lượng hàng trong kho'
    });
    
    await queryInterface.addColumn('Products', 'soldQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Số lượng đã bán thành công'
    });
  }
};

