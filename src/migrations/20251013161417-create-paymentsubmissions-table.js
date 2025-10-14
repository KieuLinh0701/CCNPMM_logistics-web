'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentSubmissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Khóa ngoại đến bảng Orders',
      },
      officeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Khóa ngoại đến bảng Offices (bưu cục)',
      },
      shipperId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Khóa ngoại đến bảng Users (shipper nộp tiền)',
      },
      amountSubmitted: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Số tiền thực tế kho/bưu cục nhận từ shipper',
      },
      discrepancy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Chênh lệch so với amountCollected trên hệ thống',
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Confirmed', 'Adjusted', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: `
          Trạng thái đối soát tiền COD:
          - Pending: Chờ kho/bưu cục xác nhận số tiền nộp từ shipper.
          - Confirmed: Đã xác nhận số tiền khớp hệ thống.
          - Adjusted: Có điều chỉnh nhỏ (thừa/thiếu).
          - Rejected: Từ chối số tiền do sai lệch lớn.
        `,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ghi chú của kho/bưu cục hoặc shipper khi đối soát',
      },
      reconciledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: `
          Thời điểm kho/bưu cục xác nhận số tiền nộp từ shipper.
          Giúp phân biệt với createdAt (thời điểm shipper nộp ban đầu).
        `,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PaymentSubmissions');
  },
};