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
      },
      officeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shipperId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        comment: 'Chênh lệch so với amountCollected',
      },
      status: {
        type: Sequelize.ENUM('Pending','Confirmed','Adjusted','Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: `
          Trạng thái đối soát tiền COD:
          - Pending: Chờ kho/bưu cục xác nhận số tiền nộp từ shipper.
          - Confirmed: Kho/bưu cục xác nhận số tiền nộp đúng với amountCollected.
          - Adjusted: Kho/bưu cục xác nhận nhưng có điều chỉnh.
          - Rejected: Kho/bưu cục từ chối số tiền nộp do sai lệch lớn.
        `,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reconciledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: `
          Thời điểm kho/bưu cục xác nhận số tiền nộp từ shipper.
          - Khi bản ghi mới được tạo, status = Pending.
          - Khi kho/bưu cục kiểm tra và cập nhật status, thời điểm đó sẽ được ghi vào reconciledAt.
        `,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PaymentSubmissions');
  }
};