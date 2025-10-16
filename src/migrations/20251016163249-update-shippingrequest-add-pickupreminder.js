'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cập nhật enum của requestType để thêm giá trị "PickupReminder"
    await queryInterface.changeColumn('ShippingRequests', 'requestType', {
      type: Sequelize.ENUM(
        'Complaint',
        'DeliveryReminder',
        'ChangeOrderInfo',
        'Inquiry',
        'PickupReminder' // ✅ thêm mới
      ),
      allowNull: false,
      comment: 'Loại yêu cầu vận chuyển',
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: xóa giá trị "PickupReminder"
    await queryInterface.changeColumn('ShippingRequests', 'requestType', {
      type: Sequelize.ENUM(
        'Complaint',
        'DeliveryReminder',
        'ChangeOrderInfo',
        'Inquiry'
      ),
      allowNull: false,
      comment: 'Loại yêu cầu vận chuyển',
    });
  },
};