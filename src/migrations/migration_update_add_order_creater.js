'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // KIỂM TRA nếu cột chưa tồn tại thì mới thêm
    const tableInfo = await queryInterface.describeTable('Orders');
    
    // Chỉ thêm createdBy nếu chưa tồn tại
    if (!tableInfo.createdBy) {
      await queryInterface.addColumn('Orders', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID của người tạo đơn (user/manager)'
      });
    }

    // Chỉ thêm createdByType nếu chưa tồn tại
    if (!tableInfo.createdByType) {
      await queryInterface.addColumn('Orders', 'createdByType', {
        type: Sequelize.ENUM('user', 'manager'),
        allowNull: false,
        comment: 'Loại người tạo đơn'
      });
    }

    // Thêm foreign key constraint (chỉ thêm nếu chưa có)
    try {
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
    } catch (error) {
      // Bỏ qua lỗi nếu constraint đã tồn tại
      console.log('Foreign key constraint may already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Xóa foreign key constraint (nếu tồn tại)
    try {
      await queryInterface.removeConstraint('Orders', 'fk_orders_createdBy');
    } catch (error) {
      console.log('Foreign key constraint may not exist');
    }

    // Xóa trường createdByType (nếu tồn tại)
    try {
      await queryInterface.removeColumn('Orders', 'createdByType');
    } catch (error) {
      console.log('Column createdByType may not exist');
    }

    // Xóa trường createdBy (nếu tồn tại)
    try {
      await queryInterface.removeColumn('Orders', 'createdBy');
    } catch (error) {
      console.log('Column createdBy may not exist');
    }
  }
};