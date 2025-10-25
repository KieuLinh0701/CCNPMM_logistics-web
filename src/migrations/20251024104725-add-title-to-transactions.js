'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Giao dịch mới',
      comment: 'Tiêu đề giao dịch',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'title');
  }
}