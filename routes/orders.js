const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @route   POST api/orders
// @desc    Create a new order
// @access  Public (in a real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const {
      distributorId,
      distributorName,
      plantId,
      plantName,
      plantImageUrl,
      items,
      specialInstructions,
      totalKg,
      totalPrice,
    } = req.body;

    console.log('Backend: Creating order for plantId:', plantId);
    console.log('Backend: Distributor:', distributorName, '(ID:', distributorId + ')');
    console.log('Backend: Items:', JSON.stringify(items));

    // Validate required fields
    if (!distributorId || !distributorName || !plantId || !plantName || !plantImageUrl || !items || !totalKg || !totalPrice) {
      console.log('Backend: Missing required fields');
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Create new order
    const order = new Order({
      distributorId,
      distributorName,
      plantId,
      plantName,
      plantImageUrl,
      items,
      specialInstructions: specialInstructions || '',
      totalKg,
      totalPrice,
    });

    const savedOrder = await order.save();
    console.log('Backend: Order saved successfully with ID:', savedOrder._id);
    console.log('Backend: Order plantId:', savedOrder.plantId);
    res.json(savedOrder);
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(500).json({ msg: 'Order creation failed', error: err.message });
  }
});

// @route   GET api/orders/plant/:plantId
// @desc    Get all orders for a specific plant
// @access  Public (in a real app, this would be protected)
router.get('/plant/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    
    console.log('Backend: Fetching orders for plantId:', plantId);
    
    if (!plantId) {
      return res.status(400).json({ msg: 'Plant ID is required' });
    }

    const orders = await Order.find({ plantId }).sort({ createdAt: -1 });
    console.log('Backend: Found', orders.length, 'orders for plantId:', plantId);
    res.json(orders);
  } catch (err) {
    console.error('Fetching orders error:', err.message);
    res.status(500).json({ msg: 'Fetching orders failed', error: err.message });
  }
});

// @route   PUT api/orders/:id/accept
// @desc    Accept an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverName } = req.body;

    console.log('Backend: Accepting order with ID:', id);

    if (!id) {
      return res.status(400).json({ msg: 'Order ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.log('Backend: Order not found with ID:', id);
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = 'accepted';
    if (driverName) {
      order.driverName = driverName;
    }

    const updatedOrder = await order.save();
    console.log('Backend: Order accepted successfully:', updatedOrder._id);
    res.json(updatedOrder);
  } catch (err) {
    console.error('Accepting order error:', err.message);
    res.status(500).json({ msg: 'Accepting order failed', error: err.message });
  }
});

// @route   PUT api/orders/:id/reject
// @desc    Reject an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Backend: Rejecting order with ID:', id);

    if (!id) {
      return res.status(400).json({ msg: 'Order ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.log('Backend: Order not found with ID:', id);
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = 'rejected';
    const updatedOrder = await order.save();
    console.log('Backend: Order rejected successfully:', updatedOrder._id);
    res.json(updatedOrder);
  } catch (err) {
    console.error('Rejecting order error:', err.message);
    res.status(500).json({ msg: 'Rejecting order failed', error: err.message });
  }
});

// @route   PUT api/orders/:id/complete
// @desc    Mark an order as completed
// @access  Public (in a real app, this would be protected)
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Backend: Completing order:', id);

    if (!id) {
      return res.status(400).json({ msg: 'Order ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = 'completed';
    const updatedOrder = await order.save();
    console.log('Backend: Order completed successfully');
    res.json(updatedOrder);
  } catch (err) {
    console.error('Completing order error:', err.message);
    res.status(500).json({ msg: 'Completing order failed', error: err.message });
  }
});

// @route   PUT api/orders/:id/cancel
// @desc    Cancel an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Backend: Cancelling order:', id);

    if (!id) {
      return res.status(400).json({ msg: 'Order ID is required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    console.log('Backend: Order cancelled successfully');
    res.json(updatedOrder);
  } catch (err) {
    console.error('Cancelling order error:', err.message);
    res.status(500).json({ msg: 'Cancelling order failed', error: err.message });
  }
});

module.exports = router;