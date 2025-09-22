'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'manager', 'driver', 'shipper', 'user'),
      defaultValue: 'user',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'manager', 'staff', 'driver'),
      defaultValue: 'staff',
      allowNull: false,
    });
  }
};