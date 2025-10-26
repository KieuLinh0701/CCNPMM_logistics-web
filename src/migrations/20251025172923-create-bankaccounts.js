'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BankAccounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID của user',
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      bankName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tên ngân hàng',
      },
      accountNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Số tài khoản',
      },
      accountName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tên chủ tài khoản',
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Có phải tài khoản mặc định không',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ghi chú thêm',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BankAccounts');
  },
};