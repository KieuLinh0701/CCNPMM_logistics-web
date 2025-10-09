'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'stock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Số lượng hàng trong kho'
    });

    await queryInterface.addColumn('Products', 'soldQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Số lượng đã bán thành công'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'stock');
    await queryInterface.removeColumn('Products', 'soldQuantity');
  }
};