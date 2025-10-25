'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'method', {
      type: Sequelize.ENUM('Cash', 'VNPay'),
      allowNull: true, // Cho phép null
      comment: 'phân loại nguồn tiền, null nếu OfficeExpense',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Transactions', 'method', {
      type: Sequelize.ENUM('Cash', 'VNPay'),
      allowNull: false, // Quay lại không cho null
      comment: 'phân loại nguồn tiền',
    });
  }
};