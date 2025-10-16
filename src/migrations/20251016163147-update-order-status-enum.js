'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tạo giá trị ENUM mới bao gồm 2 trạng thái mới: delivering và returning
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM(
        'draft',
        'pending',
        'confirmed',
        'picked_up',
        'in_transit',
        'delivering',
        'delivered',
        'cancelled',
        'returning',
        'returned'
      ),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Trạng thái đơn hàng',
    });
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục ENUM cũ nếu rollback
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM(
        'draft',
        'pending',
        'confirmed',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
        'returned'
      ),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Trạng thái đơn hàng',
    });
  },
};