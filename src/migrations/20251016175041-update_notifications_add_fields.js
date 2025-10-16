'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Cho phép userId null
    await queryInterface.changeColumn('Notifications', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2. Thêm officeId
    await queryInterface.addColumn('Notifications', 'officeId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Offices',
        key: 'id',
      },
    });

    // 3. Thêm targetRole
    await queryInterface.addColumn('Notifications', 'targetRole', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback
    await queryInterface.changeColumn('Notifications', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.removeColumn('Notifications', 'officeId');
    await queryInterface.removeColumn('Notifications', 'targetRole');
  }
};