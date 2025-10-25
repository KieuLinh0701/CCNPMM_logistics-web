'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PaymentSubmissions', 'submittedByType');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('PaymentSubmissions', 'submittedByType', {
      type: Sequelize.ENUM('user', 'shipper', 'guest'),
      allowNull: false,
      defaultValue: 'user',
      comment: 'Xác định người nộp tiền là user (khách) hay shipper',
    });
  },
};