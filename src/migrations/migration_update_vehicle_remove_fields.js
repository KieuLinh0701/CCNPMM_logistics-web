'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cập nhật ENUM status để loại bỏ 'Archived'
    await queryInterface.changeColumn('Vehicles', 'status', {
      type: Sequelize.ENUM('Available', 'InUse', 'Maintenance'),
      allowNull: false,
      defaultValue: 'Available',
      comment: 'Trạng thái xe',
    });
  },

  async down(queryInterface, Sequelize) {
    // // Khôi phục trường officeId
    // await queryInterface.addColumn('Vehicles', 'officeId', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: 'Xe thuộc về chi nhánh nào',
    // });
    
    // Khôi phục ENUM status (thêm lại 'Archived')
    await queryInterface.changeColumn('Vehicles', 'status', {
      type: Sequelize.ENUM('Available', 'InUse', 'Maintenance', 'Archived'),
      allowNull: false,
      defaultValue: 'Available',
      comment: 'Trạng thái xe',
    });
  }
};

