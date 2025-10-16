'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ShippingRequests', 'handlerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID người xử lý/ phản hồi yêu cầu',
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('ShippingRequests', 'responseAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Thời gian phản hồi yêu cầu',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ShippingRequests', 'handlerId');
    await queryInterface.removeColumn('ShippingRequests', 'responseAt');
  }
};