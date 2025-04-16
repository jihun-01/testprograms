const express = require('express');
const router = express.Router();

const warehouseRoutes = require('./warehouseRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const orderRoutes = require('./orderRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const customerRoutes = require('./customerRoutes');

router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/customers', customerRoutes);

module.exports = router; 