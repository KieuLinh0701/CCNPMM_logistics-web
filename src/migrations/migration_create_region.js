'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      codeCity: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      regionName: {
        type: Sequelize.ENUM('North', 'Central', 'South'),
        allowNull: false,
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
    // Cần drop enum trước để tránh lỗi khi rollback
    await queryInterface.dropTable('Regions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Regions_regionName";');
  },
};