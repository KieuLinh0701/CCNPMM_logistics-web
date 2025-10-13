import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // 1 Order có nhiều lịch sử vận chuyển
      Order.hasMany(models.OrderHistory, {
        foreignKey: 'orderId',
        as: 'histories',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // 1 Order thuộc về 1 User (chủ cửa hàng)
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      Order.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // 1 Order có thể tham chiếu tới kho nguồn và kho đích
      Order.belongsTo(models.Office, {
        foreignKey: 'fromOfficeId',
        as: 'fromOffice',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      Order.belongsTo(models.Office, {
        foreignKey: 'toOfficeId',
        as: 'toOffice',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // 1 Order thuộc về 1 dịch vụ giao hàng
      Order.belongsTo(models.ServiceType, {
        foreignKey: 'serviceTypeId',
        as: 'serviceType',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });

      // 1 Order có thể áp dụng 1 chương trình khuyến mãi
      Order.belongsTo(models.Promotion, {
        foreignKey: 'promotionId',
        as: 'promotion',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // 1 Order có nhiều ShipmentOrder
      Order.hasMany(models.ShipmentOrder, {
        foreignKey: 'orderId',
        as: 'shipmentOrders',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      Order.belongsToMany(models.Product, {
        through: models.OrderProduct,
        foreignKey: 'orderId',
        as: 'products',
      });

      // Order.js
      Order.hasMany(models.OrderProduct, {
        foreignKey: 'orderId',
        as: 'orderProducts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Order.init(
    {
      trackingNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Mã vận đơn'
      },

      status: {
        type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned'),
        defaultValue: 'pending',
        comment: 'Trạng thái đơn hàng'
      },

      // Người tạo đơn (user/manager tại office)
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID của người tạo đơn (staff/manager)'
      },

      // Loại người tạo
      createdByType: {
        type: DataTypes.ENUM('user', 'manager'),
        allowNull: false,
        comment: 'Loại người tạo đơn'
      },

      // Người gửi giá trị này chỉ khác null khi order không được tạo bởi user
      senderName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Tên người gửi'
      },
      senderPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'SĐT người gửi'
      },

      // Địa chỉ người gửi
      senderCityCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      senderWardCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      senderDetailAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Người nhận 
      recipientName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Tên người nhận'
      },
      recipientPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'SĐT người nhận'
      },

      // Địa chỉ người nhận
      recipientCityCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientWardCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientDetailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Khối lượng 
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },

      serviceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Chương trình khuyến mãi (nếu có)
      promotionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      discountAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      // Phí vận chuyển
      shippingFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },

      // Tiền thu hộ
      cod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      // Giá trị đơn hàng 
      orderValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },

      payer: {
        type: DataTypes.ENUM('Customer', 'Shop'),
        allowNull: false,
        defaultValue: 'Customer',
      },
      paymentMethod: {
        type: DataTypes.ENUM('Cash', 'BankTransfer', 'VNPay', 'ZaloPay'),
        allowNull: false,
        defaultValue: 'Cash',
      },
      paymentStatus: {
        type: DataTypes.ENUM('Paid', 'Unpaid', 'Refunded'),
        allowNull: false,
        defaultValue: 'Unpaid',
      },

      // Người tạo đơn
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Ghi chú
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú'
      },

      // Thời gian giao hàng
      deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Bưu cục giao nhận
      fromOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      toOfficeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Order;
};