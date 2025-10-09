'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'senderCityCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('Orders', 'senderWardCode', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('Orders', 'recipientCityCode', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('Orders', 'recipientWardCode', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Orders', 'senderCityCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Orders', 'senderWardCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Orders', 'recipientCityCode', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('Orders', 'recipientWardCode', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};