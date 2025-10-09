'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'Orders',       // tên bảng
        'status',       // tên cột
        {
          type: Sequelize.ENUM('draft','pending','confirmed','picked_up','in_transit','delivered','cancelled'),
          allowNull: false,
          defaultValue: 'draft',
        },
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'Orders',
        'status',
        {
          type: Sequelize.ENUM('pending','confirmed','picked_up','in_transit','delivered','cancelled'),
          allowNull: false,
          defaultValue: 'pending',
        },
        { transaction }
      );
    });
  }
};