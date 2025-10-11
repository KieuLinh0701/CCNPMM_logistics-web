'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {   
    // Cập nhật ENUM role để thêm 'staff'
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'manager', 'staff', 'driver', 'shipper', 'user'),
      allowNull: false,
      defaultValue: 'user',
    });
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục ENUM role (loại bỏ 'staff')
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'manager', 'driver', 'shipper', 'user'),
      allowNull: false,
      defaultValue: 'user',
    });
  }
};

