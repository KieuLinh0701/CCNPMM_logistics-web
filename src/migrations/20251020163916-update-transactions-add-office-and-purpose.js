'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🟩 Thêm cột officeId
    await queryInterface.addColumn('Transactions', 'officeId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Offices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 🟩 Thêm cột purpose
    await queryInterface.addColumn('Transactions', 'purpose', {
      type: Sequelize.ENUM(
        'Refund',          // Hoàn tiền cho khách hàng
        'CODReturn',       // Trả tiền COD về cho shop
        'ShippingService', // Thanh toán phí dịch vụ vận chuyển
        'OfficeExpense',   // Chi phí nội bộ văn phòng
        'RevenueTransfer'  // Chuyển doanh thu lên tổng
      ),
      allowNull: false,
      defaultValue: 'ShippingService',
      comment: 'Mục đích của giao dịch',
    });

    // 🟧 Nếu cột method có ENUM cũ cần mở rộng / giới hạn lại
    await queryInterface.changeColumn('Transactions', 'method', {
      type: Sequelize.ENUM('Cash', 'VNPay'),
      allowNull: false,
      comment: 'Phân loại nguồn tiền',
    });
  },

  async down(queryInterface, Sequelize) {
    // 🟥 Xóa cột officeId
    await queryInterface.removeColumn('Transactions', 'officeId');

    // 🟥 Xóa cột purpose và enum của nó
    await queryInterface.removeColumn('Transactions', 'purpose');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Transactions_purpose";');

    // 🟥 Rollback cột method về định nghĩa cũ (nếu cần)
    await queryInterface.changeColumn('Transactions', 'method', {
      type: Sequelize.ENUM('Cash', 'VNPay', 'Refund'),
      allowNull: false,
      comment: 'phân loại nguồn tiền hoặc lý do chi tiêu',
    });
  },
};