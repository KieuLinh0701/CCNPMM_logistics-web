'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'paidAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Thời gian thanh toán đơn hàng',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'paidAt');
  }
};