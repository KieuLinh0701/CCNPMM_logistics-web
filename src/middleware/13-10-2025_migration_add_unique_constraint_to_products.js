'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Kiểm tra xem constraint đã tồn tại chưa
    const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_NAME = 'Products' 
        AND CONSTRAINT_NAME = 'unique_product_per_user';
    `);

    if (results.length === 0) {
      // Nếu chưa có thì mới thêm
      await queryInterface.addConstraint('Products', {
        fields: ['userId', 'name'],
        type: 'unique',
        name: 'unique_product_per_user',
      });
      console.log('✅ Added constraint unique_product_per_user');
    } else {
      console.log('⚠️ Constraint unique_product_per_user already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Xóa constraint nếu tồn tại
    const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_NAME = 'Products' 
        AND CONSTRAINT_NAME = 'unique_product_per_user';
    `);

    if (results.length > 0) {
      await queryInterface.removeConstraint('Products', 'unique_product_per_user');
      console.log('🗑️ Removed constraint unique_product_per_user');
    } else {
      console.log('⚠️ Constraint unique_product_per_user not found, skipping...');
    }
  },
};