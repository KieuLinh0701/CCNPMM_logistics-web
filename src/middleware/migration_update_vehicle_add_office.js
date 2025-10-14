'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Vehicles', 'officeId', {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: 'Xe thuộc về chi nhánh nào',
    references: {
      model: 'Offices', 
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Vehicles', 'officeId');
}