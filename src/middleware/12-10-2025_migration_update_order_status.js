'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thay đổi ENUM type cho status
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders 
      MODIFY COLUMN status 
      ENUM('draft', 'pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned') 
      NOT NULL DEFAULT 'Pending'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders 
      MODIFY COLUMN status 
      ENUM('draft', 'pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled') 
      NOT NULL DEFAULT 'Pending'
    `);
  }
};