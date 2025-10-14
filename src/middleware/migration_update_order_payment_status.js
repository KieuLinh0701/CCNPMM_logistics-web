'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Orders', 'paymentStatus', {
      type: Sequelize.ENUM('Paid', 'Unpaid', 'Refunded'),
      allowNull: false,
      defaultValue: 'Unpaid',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Orders', 'paymentStatus', {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      allowNull: false,
      defaultValue: 'Unpaid',
    });
  }
};