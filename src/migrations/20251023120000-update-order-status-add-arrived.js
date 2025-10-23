'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm trạng thái mới 'arrived_at_office' vào ENUM Orders.status
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
        'returned',
        'arrived_at_office'
      ),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Trạng thái đơn hàng',
    });
  },

  async down(queryInterface, Sequelize) {
    // Loại bỏ trạng thái 'arrived_at_office' khỏi ENUM Orders.status (khôi phục danh sách cũ)
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
};


