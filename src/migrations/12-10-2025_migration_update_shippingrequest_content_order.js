'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thay đổi cột requestContent cho phép NULL
    await queryInterface.changeColumn('ShippingRequests', 'requestContent', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Nội dung yêu cầu chi tiết',
    });

    // Thay đổi cột orderId cho phép NULL
    await queryInterface.changeColumn('ShippingRequests', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Liên kết tới đơn hàng',
    });
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục lại cột requestContent không cho phép NULL
    await queryInterface.changeColumn('ShippingRequests', 'requestContent', {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'Nội dung yêu cầu chi tiết',
    });

    // Khôi phục lại cột orderId không cho phép NULL
    await queryInterface.changeColumn('ShippingRequests', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Liên kết tới đơn hàng',
    });
  }
};