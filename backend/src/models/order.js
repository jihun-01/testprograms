const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const Customer = require('./customer');

const OrderStatus = sequelize.define('OrderStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'order_status',
  timestamps: false
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'order_status',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 관계 설정
Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Order.belongsTo(OrderStatus, { foreignKey: 'status_id' });

module.exports = { Order, OrderStatus };