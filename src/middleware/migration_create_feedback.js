// Migration: Create Feedback table
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Feedbacks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID đơn hàng được đánh giá',
        references: {
          model: 'Orders',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID người đánh giá',
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Điểm đánh giá từ 1-5 sao'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Nhận xét chi tiết'
      },
      serviceRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Đánh giá chất lượng dịch vụ 1-5 sao'
      },
      deliveryRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Đánh giá thái độ nhân viên giao hàng 1-5 sao'
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Đánh giá ẩn danh'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint to prevent multiple feedbacks for same order
    await queryInterface.addConstraint('Feedbacks', {
      fields: ['orderId'],
      type: 'unique',
      name: 'unique_order_feedback'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Feedbacks', 'unique_order_feedback');
    await queryInterface.dropTable('Feedbacks');
  }
};


