'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'refundedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Thời gian hoàn trả tiền đơn hàng',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'refundedAt');
  }
};