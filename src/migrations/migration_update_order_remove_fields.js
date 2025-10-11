'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa các trường không còn sử dụng trong bảng Orders
    await queryInterface.removeColumn('Orders', 'createdBy');
    await queryInterface.removeColumn('Orders', 'createdByType');
    
    // Thay đổi kiểu dữ liệu của các trường địa chỉ từ INTEGER sang STRING
    await queryInterface.changeColumn('Orders', 'senderCityCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('Orders', 'senderWardCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('Orders', 'recipientCityCode', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    await queryInterface.changeColumn('Orders', 'recipientWardCode', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
    // Cập nhật ENUM cho status (loại bỏ 'draft')
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    });
    
    // Cập nhật ENUM cho paymentStatus (loại bỏ 'Refunded')
    await queryInterface.changeColumn('Orders', 'paymentStatus', {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      allowNull: false,
      defaultValue: 'Unpaid',
    });
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục các trường đã xóa
    await queryInterface.addColumn('Orders', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'ID của người tạo đơn (staff/manager)'
    });
    
    await queryInterface.addColumn('Orders', 'createdByType', {
      type: Sequelize.ENUM('user', 'manager'),
      allowNull: false,
      comment: 'Loại người tạo đơn'
    });
    
    // Khôi phục kiểu dữ liệu INTEGER cho các trường địa chỉ
    await queryInterface.changeColumn('Orders', 'senderCityCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('Orders', 'senderWardCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('Orders', 'recipientCityCode', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    
    await queryInterface.changeColumn('Orders', 'recipientWardCode', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    
    // Khôi phục ENUM cho status (thêm lại 'draft')
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('draft', 'pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    });
    
    // Khôi phục ENUM cho paymentStatus (thêm lại 'Refunded')
    await queryInterface.changeColumn('Orders', 'paymentStatus', {
      type: Sequelize.ENUM('Paid', 'Unpaid', 'Refunded'),
      allowNull: false,
      defaultValue: 'Unpaid',
    });
  }
};

