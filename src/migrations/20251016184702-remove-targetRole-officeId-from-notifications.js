'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa 2 cột dư thừa
    await queryInterface.removeColumn('notifications', 'targetRole');
    await queryInterface.removeColumn('notifications', 'officeId');
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback, thêm lại cột với kiểu dữ liệu cũ
    await queryInterface.addColumn('notifications', 'targetRole', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('notifications', 'officeId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};