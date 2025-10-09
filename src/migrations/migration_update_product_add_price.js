'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'price', {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Giá sản phẩm',
      defaultValue: 0, 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'price');
  }
};
