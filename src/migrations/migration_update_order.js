'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Người gửi
    await queryInterface.addColumn('Orders', 'senderCityCode', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Orders', 'senderWardCode', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Orders', 'senderDetailAddress', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.changeColumn('Orders', 'senderName', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.changeColumn('Orders', 'senderPhone', { type: Sequelize.STRING(20), allowNull: true });

    // 2. Người nhận
    await queryInterface.addColumn('Orders', 'recipientName', { type: Sequelize.STRING(100), allowNull: false });
    await queryInterface.addColumn('Orders', 'recipientPhone', { type: Sequelize.STRING(20), allowNull: false });
    await queryInterface.addColumn('Orders', 'recipientCityCode', { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn('Orders', 'recipientWardCode', { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn('Orders', 'recipientDetailAddress', { type: Sequelize.STRING, allowNull: false });

    // 3. Tiền thu hộ
    await queryInterface.addColumn('Orders', 'cod', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 4. Xóa các cột địa chỉ cũ
    await queryInterface.removeColumn('Orders', 'cityCode');
    await queryInterface.removeColumn('Orders', 'wardCode');
    await queryInterface.removeColumn('Orders', 'detailAddress');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert
    await queryInterface.removeColumn('Orders', 'senderCityCode');
    await queryInterface.removeColumn('Orders', 'senderWardCode');
    await queryInterface.removeColumn('Orders', 'senderDetailAddress');
    await queryInterface.changeColumn('Orders', 'senderName', { type: Sequelize.STRING(100), allowNull: false });
    await queryInterface.changeColumn('Orders', 'senderPhone', { type: Sequelize.STRING(20), allowNull: false });

    await queryInterface.removeColumn('Orders', 'recipientName');
    await queryInterface.removeColumn('Orders', 'recipientPhone');
    await queryInterface.removeColumn('Orders', 'recipientCityCode');
    await queryInterface.removeColumn('Orders', 'recipientWardCode');
    await queryInterface.removeColumn('Orders', 'recipientDetailAddress');

    await queryInterface.removeColumn('Orders', 'cod');

    // Khôi phục các cột địa chỉ cũ
    await queryInterface.addColumn('Orders', 'cityCode', { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn('Orders', 'wardCode', { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn('Orders', 'detailAddress', { type: Sequelize.STRING, allowNull: false });
  }
};