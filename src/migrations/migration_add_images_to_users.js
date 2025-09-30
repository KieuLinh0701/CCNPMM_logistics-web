'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột images vào bảng users nếu chưa có
    await queryInterface.addColumn('users', 'images', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Lưu tên file ảnh avatar (trong C:/uploads)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Gỡ cột images khi rollback
    await queryInterface.removeColumn('users', 'images');
  }
};


