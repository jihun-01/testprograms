const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

// 모델 가져오기
const Customer = require('./customer');
const { Order, OrderStatus } = require('./order');
const Product = require('./product');
const Warehouse = require('./warehouse');
const Inventory = require('./inventory');
const Shipment = require('./shipment');
const User = require('./user');
const OrderDetail = require('./orderDetail');

// 관계 설정
// Customer - Order
Customer.hasMany(Order, { foreignKey: 'customer_id' });

// Order - OrderStatus
Order.belongsTo(OrderStatus, { foreignKey: 'status_id' });
OrderStatus.hasMany(Order, { foreignKey: 'status_id' });

// Order - OrderDetail
Order.hasMany(OrderDetail, { foreignKey: 'order_id' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });

// OrderDetail - Product
OrderDetail.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderDetail, { foreignKey: 'product_id' });

// OrderDetail - Warehouse
OrderDetail.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Warehouse.hasMany(OrderDetail, { foreignKey: 'warehouse_id' });

// Product - Inventory
Product.hasMany(Inventory, { foreignKey: 'product_id' });
Inventory.belongsTo(Product, { foreignKey: 'product_id' });

// Warehouse - Inventory
Warehouse.hasMany(Inventory, { foreignKey: 'warehouse_id' });
Inventory.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

// Order - Shipment
Shipment.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(Shipment, { foreignKey: 'order_id' });

// Warehouse - Shipment
Shipment.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Warehouse.hasMany(Shipment, { foreignKey: 'warehouse_id' });

module.exports = {
  sequelize,
  Customer,
  Order,
  OrderStatus,
  Product,
  Warehouse,
  Inventory,
  Shipment,
  User,
  OrderDetail
}; 