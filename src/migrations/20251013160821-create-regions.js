'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      codeCity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'Mã thành phố',
      },
      regionName: {
        type: Sequelize.ENUM('North', 'Central', 'South'),
        allowNull: false,
        comment: 'Tên vùng: Bắc, Trung, Nam',
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
    await queryInterface.dropTable('Regions');
  },
};