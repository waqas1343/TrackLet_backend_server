const express = require('express');
const router = express.Router();
const { 
  getDistributorDrivers,
  assignDriverToOrder,
  getDriverOrders,
  createDriver
} = require('../controllers/driversController');
const { userAuth } = require('../routes/login');

// GET /api/drivers/distributor/:distributorId - Get all drivers for a distributor
router.get('/distributor/:distributorId', userAuth, getDistributorDrivers);

// POST /api/drivers - Create a new driver
router.post('/', userAuth, createDriver);

// PUT /api/drivers/order/:orderId/assign - Assign driver to order
router.put('/order/:orderId/assign', userAuth, assignDriverToOrder);

// GET /api/drivers/:driverId/orders - Get orders assigned to a driver
router.get('/:driverId/orders', userAuth, getDriverOrders);

module.exports = router;