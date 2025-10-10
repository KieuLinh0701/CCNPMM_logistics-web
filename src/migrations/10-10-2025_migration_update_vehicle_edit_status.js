'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Vehicles', 'status', {
      type: Sequelize.ENUM('Available', 'InUse', 'Maintenance', 'Archived'),
      allowNull: false,
      defaultValue: 'Available'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Vehicles', 'status', {
      type: Sequelize.ENUM('Available', 'InUse', 'Maintenance'),
      allowNull: false,
      defaultValue: 'Available'
    });
  }
};