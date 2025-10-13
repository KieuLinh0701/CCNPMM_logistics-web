// File: migrations/XXXXXX-add-unique-constraint-to-products.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm unique constraint
    await queryInterface.addConstraint('Products', {
      fields: ['userId', 'name'],
      type: 'unique',
      name: 'unique_product_per_user'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa unique constraint khi rollback
    await queryInterface.removeConstraint('Products', 'unique_product_per_user');
  }
};