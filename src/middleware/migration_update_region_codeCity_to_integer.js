'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Đổi cột codeCity từ STRING sang INTEGER
    await queryInterface.changeColumn('Regions', 'codeCity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback, trả về STRING như ban đầu
    await queryInterface.changeColumn('Regions', 'codeCity', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};