'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cho phép shipperId nullable
    await queryInterface.changeColumn('PaymentSubmissions', 'shipperId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Shipper có thể null khi khách thanh toán online',
    });

    // Thêm amountCollected
    await queryInterface.addColumn('PaymentSubmissions', 'amountCollected', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Số tiền COD hệ thống ghi nhận từ đơn hàng',
    });

    // Thêm confirmedBy
    await queryInterface.addColumn('PaymentSubmissions', 'confirmedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'User/kho/bưu cục xác nhận đối soát',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // rollback
    await queryInterface.removeColumn('PaymentSubmissions', 'confirmedBy');
    await queryInterface.removeColumn('PaymentSubmissions', 'amountCollected');
    await queryInterface.changeColumn('PaymentSubmissions', 'shipperId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};