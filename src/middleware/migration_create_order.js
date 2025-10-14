'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Orders', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    trackingNumber: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Mã vận đơn',
    },

    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Trạng thái đơn hàng',
    },

    // Người gửi
    senderName: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Tên người gửi',
    },
    senderPhone: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'SĐT người gửi',
    },

    // Địa chỉ giao hàng
    cityCode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    wardCode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    detailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // Khối lượng
    weight: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    serviceTypeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'ServiceTypes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },

    // Chương trình khuyến mãi
    promotionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Promotions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    discountAmount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    shippingFee: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    orderValue: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    payer: {
      type: Sequelize.ENUM('Customer', 'Shop'),
      allowNull: false,
      defaultValue: 'Customer',
    },

    paymentMethod: {
      type: Sequelize.ENUM('Cash', 'BankTransfer', 'VNPay', 'ZaloPay'),
      allowNull: false,
      defaultValue: 'Cash',
    },

    paymentStatus: {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      allowNull: false,
      defaultValue: 'Unpaid',
    },

    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    deliveredAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    fromOfficeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Offices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    toOfficeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Offices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Orders');
}