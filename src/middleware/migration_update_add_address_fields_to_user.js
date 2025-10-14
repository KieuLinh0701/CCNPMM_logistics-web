'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      // queryInterface.addColumn('Users', 'detailAddress', {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // }),
      // queryInterface.addColumn('Users', 'codeWard', {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      // }),
      // queryInterface.addColumn('Users', 'codeCity', {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      // }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Users', 'detailAddress'),
      queryInterface.removeColumn('Users', 'codeWard'),
      queryInterface.removeColumn('Users', 'codeCity'),
    ]);
  }
};