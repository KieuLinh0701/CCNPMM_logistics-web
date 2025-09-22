'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ShippingRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Liên kết tới đơn hàng',
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      officeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Bưu cục/Đơn vị vận chuyển xử lý yêu cầu',
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      requestType: {
        type: Sequelize.ENUM('Complaint', 'DeliveryReminder', 'ChangeOrderInfo', 'Inquiry'),
        allowNull: false,
        comment: 'Loại yêu cầu: Khiếu nại, hối giao hàng, đổi thông tin, tư vấn',
      },

      requestContent: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Nội dung yêu cầu chi tiết',
      },

      status: {
        type: Sequelize.ENUM('Pending', 'Processing', 'Resolved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending',
        comment: 'Trạng thái xử lý yêu cầu',
      },

      response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Phản hồi từ đơn vị vận chuyển (nếu có)',
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ShippingRequests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ShippingRequests_requestType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ShippingRequests_status";');
  },
};