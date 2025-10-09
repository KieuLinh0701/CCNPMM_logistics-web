'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm trường createdBy
    await queryInterface.addColumn('Orders', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'ID của người tạo đơn (user/manager)'
    });

    // Thêm trường createdByType
    await queryInterface.addColumn('Orders', 'createdByType', {
      type: Sequelize.ENUM('user', 'manager'),
      allowNull: false,
      comment: 'Loại người tạo đơn'
    });

    // Thêm foreign key constraint
    await queryInterface.addConstraint('Orders', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_orders_createdBy',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa foreign key constraint trước
    await queryInterface.removeConstraint('Orders', 'fk_orders_createdBy');

    // Xóa trường createdByType
    await queryInterface.removeColumn('Orders', 'createdByType');

    // Xóa trường createdBy
    await queryInterface.removeColumn('Orders', 'createdBy');
  }
};