const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const { Order } = require('./order');
const Warehouse = require('./warehouse');

const Shipment = sequelize.define('Shipment', {
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
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  shipment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  carrier: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 관계 설정
Shipment.belongsTo(Order, { foreignKey: 'order_id' });
Shipment.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
Order.hasMany(Shipment, { foreignKey: 'order_id' });
Warehouse.hasMany(Shipment, { foreignKey: 'warehouse_id' });

module.exports = Shipment;