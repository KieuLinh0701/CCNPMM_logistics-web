'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Transactions', 'status', {
      type: Sequelize.ENUM('Pending', 'Confirmed', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
      comment: 'Trạng thái xác nhận giao dịch'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Transactions', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Transactions_status";');
  }
};