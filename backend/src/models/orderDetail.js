const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const { Order } = require('./order');
const Product = require('./product');
const Warehouse = require('./warehouse');

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 관계 설정
OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id' });
OrderDetail.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Order.hasMany(OrderDetail, { foreignKey: 'order_id' });
Product.hasMany(OrderDetail, { foreignKey: 'product_id' });
Warehouse.hasMany(OrderDetail, { foreignKey: 'warehouse_id' });

module.exports = OrderDetail;