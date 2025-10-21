'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Đổi tên trường 'action' thành 'status' trong bảng OrderHistories
    await queryInterface.renameColumn('OrderHistories', 'action', 'status');
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục tên trường từ 'status' về 'action'
    await queryInterface.renameColumn('OrderHistories', 'status', 'action');
  }
};

