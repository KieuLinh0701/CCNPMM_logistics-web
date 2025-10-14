'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thay đổi ENUM type cho status
    await queryInterface.sequelize.query(`
      ALTER TABLE ShippingRequests 
      MODIFY COLUMN status 
      ENUM('Pending', 'Processing', 'Resolved', 'Rejected', 'Cancelled') 
      NOT NULL DEFAULT 'Pending'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE ShippingRequests 
      MODIFY COLUMN status 
      ENUM('Pending', 'Processing', 'Resolved', 'Rejected') 
      NOT NULL DEFAULT 'Pending'
    `);
  }
};