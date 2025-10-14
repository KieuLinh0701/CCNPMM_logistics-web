'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      trackingNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã vận đơn',
      },
      status: {
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
        defaultValue: 'pending',
        comment: 'Trạng thái đơn hàng',
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID người tạo đơn (staff/manager)',
      },
      createdByType: {
        type: Sequelize.ENUM('user', 'manager'),
        allowNull: false,
        comment: 'Loại người tạo đơn',
      },
      senderName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tên người gửi',
      },
      senderPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'SĐT người gửi',
      },
      senderCityCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      senderWardCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      senderDetailAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recipientName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tên người nhận',
      },
      recipientPhone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'SĐT người nhận',
      },
      recipientCityCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recipientWardCode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recipientDetailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      serviceTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ServiceTypes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      promotionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Promotions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      discountAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      shippingFee: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cod: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      orderValue: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      payer: {
        type: Sequelize.ENUM('Customer', 'Shop'),
        allowNull: false,
        defaultValue: 'Customer',
      },
      paymentMethod: {
        type: Sequelize.ENUM('Cash', 'BankTransfer', 'VNPay', 'ZaloPay'),
        allowNull: false,
        defaultValue: 'Cash',
      },
      paymentStatus: {
        type: Sequelize.ENUM('Paid', 'Unpaid', 'Refunded'),
        allowNull: false,
        defaultValue: 'Unpaid',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ghi chú',
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fromOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      toOfficeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Offices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.dropTable('Orders');
  },
};