// Tạo file migration mới
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột price
    await queryInterface.addColumn('Products', 'price', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Thêm cột stock
    await queryInterface.addColumn('Products', 'stock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Thêm cột soldQuantity
    await queryInterface.addColumn('Products', 'soldQuantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'price');
    await queryInterface.removeColumn('Products', 'stock');
    await queryInterface.removeColumn('Products', 'soldQuantity');
  }
};