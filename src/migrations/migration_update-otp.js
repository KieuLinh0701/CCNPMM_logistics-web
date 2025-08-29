'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm 'reset' vào ENUM
    await queryInterface.sequelize.query(
      "ALTER TABLE `otps` MODIFY COLUMN `type` ENUM('register','reset') NOT NULL;"
    );
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback, trả về enum cũ
    await queryInterface.sequelize.query(
      "ALTER TABLE `otps` MODIFY COLUMN `type` ENUM('register','forgot_password') NOT NULL;"
    );
  }
};