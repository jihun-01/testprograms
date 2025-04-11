const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'warehouses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Warehouse;