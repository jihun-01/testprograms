const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: false,
    defaultValue: 0
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  max_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  location_in_warehouse: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_restock_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'warehouse_id']
    }
  ]
});

module.exports = Inventory;