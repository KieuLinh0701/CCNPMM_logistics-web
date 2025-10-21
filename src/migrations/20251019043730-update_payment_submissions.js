'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Thêm cột mới
    await queryInterface.addColumn('PaymentSubmissions', 'submittedById', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Shipper hoặc user nếu khách nộp trực tiếp',
    });

    await queryInterface.addColumn('PaymentSubmissions', 'submittedByType', {
      type: Sequelize.ENUM('user', 'shipper', 'guest'),
      allowNull: false,
      defaultValue: 'user',
      comment: 'Xác định người nộp tiền là user (khách) hay shipper',
    });

    await queryInterface.addColumn('PaymentSubmissions', 'totalAmountSubmitted', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Tổng tiền nộp từ shipper hoặc khách',
    });

    await queryInterface.addColumn('PaymentSubmissions', 'confirmedById', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Người xác nhận đối soát',
    });

    await queryInterface.addColumn('PaymentSubmissions', 'orderIds', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Danh sách ID đơn hàng trong lô tiền nộp',
    });

    // 2. Xóa cột cũ
    await queryInterface.removeColumn('PaymentSubmissions', 'orderId');
    await queryInterface.removeColumn('PaymentSubmissions', 'shipperId');
    await queryInterface.removeColumn('PaymentSubmissions', 'amountSubmitted');
    await queryInterface.removeColumn('PaymentSubmissions', 'amountCollected');
    await queryInterface.removeColumn('PaymentSubmissions', 'discrepancy');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Thêm lại cột cũ
    await queryInterface.addColumn('PaymentSubmissions', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('PaymentSubmissions', 'shipperId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('PaymentSubmissions', 'amountSubmitted', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('PaymentSubmissions', 'amountCollected', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('PaymentSubmissions', 'discrepancy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 2. Xóa cột mới
    await queryInterface.removeColumn('PaymentSubmissions', 'submittedById');
    await queryInterface.removeColumn('PaymentSubmissions', 'submittedByType');
    await queryInterface.removeColumn('PaymentSubmissions', 'totalAmountSubmitted');
    await queryInterface.removeColumn('PaymentSubmissions', 'confirmedById');
    await queryInterface.removeColumn('PaymentSubmissions', 'orderIds');
  }
};