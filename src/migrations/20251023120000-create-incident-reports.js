'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('IncidentReports', {
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
        comment: 'Đơn hàng liên quan đến sự cố',
      },
      shipperId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Shipper báo cáo sự cố',
      },
      incidentType: {
        type: Sequelize.ENUM(
          'recipient_not_available',
          'wrong_address', 
          'package_damaged',
          'recipient_refused',
          'security_issue',
          'other'
        ),
        allowNull: false,
        comment: 'Loại sự cố',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Tiêu đề báo cáo',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Mô tả chi tiết sự cố',
      },
      location: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Địa điểm xảy ra sự cố',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Mức độ ưu tiên',
      },
      recipientName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tên người nhận',
      },
      recipientPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Số điện thoại người nhận',
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Danh sách URL hình ảnh',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'resolved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Trạng thái xử lý',
      },
      resolution: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Giải pháp xử lý',
      },
      handledBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Người xử lý báo cáo',
      },
      handledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Thời điểm xử lý',
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
    await queryInterface.dropTable('IncidentReports');
  }
};
