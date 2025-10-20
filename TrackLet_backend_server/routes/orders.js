const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const GasPlant = require('../models/GasPlant'); // New model
const User = require('../models/User'); // Import User model
const NotificationService = require('../services/notificationService'); // Import Notification Service

// @route   POST api/orders
// @desc    Create a new order
// @access  Public (in a real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const {
      distributorId,
      distributorName,
      distributorEmail,
      plantId,
      plantName,
      plantEmail,
      items,
      specialInstructions,
      totalKg,
      totalPrice,
    } = req.body;

    // Validate required fields
    if (!distributorId || !distributorName || !distributorEmail || !plantId || !plantName || !plantEmail || !items || !totalKg || !totalPrice) {
      return res.status(400).json({ 
        success: false,
        msg: 'Missing required fields: distributorId, distributorName, distributorEmail, plantId, plantName, plantEmail, items, totalKg, totalPrice' 
      });
    }

    // Validate email formats
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(distributorEmail)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid distributor email format' 
      });
    }
    
    if (!emailRegex.test(plantEmail)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid plant email format' 
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'Items must be a non-empty array' 
      });
    }

    // Validate item structure
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.weight || !item.quantity || item.weight <= 0 || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          msg: `Invalid item at position ${i + 1}. Weight and quantity must be positive numbers.` 
        });
      }
    }

    // Validate numeric fields
    if (totalKg <= 0 || totalPrice <= 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'Total kg and total price must be positive numbers' 
      });
    }

    // Get companyEmail and plantImageUrl from GasPlant collection
    const gasPlant = await GasPlant.findOne({ ownerEmail: plantEmail });
    const companyEmail = gasPlant ? gasPlant.companyEmail : plantEmail; // Fallback to plantEmail if not found
    const plantImageUrl = gasPlant ? gasPlant.imageUrl : ''; // Get the latest plant image URL

    // Create new order with correct initial status
    const order = new Order({
      distributorId,
      distributorName,
      distributorEmail,
      plantId,
      plantName,
      plantEmail,
      plantImageUrl, // Use the latest plant image URL from the database
      companyEmail, // Add companyEmail to order
      items,
      specialInstructions: specialInstructions || '',
      totalKg,
      totalPrice,
      status: 'new', // Set initial status to 'new'
      driverId: null, // Initialize driverId as null
      driverName: null, // Initialize driverName as null
    });

    const savedOrder = await order.save();
    
    // Send notification to Gas Plant when order is placed
    try {
      // Find gas plant user
      const gasPlantUser = await User.findOne({ email: plantEmail });
      const distributorUser = await User.findOne({ email: distributorEmail });
      
      if (gasPlantUser && distributorUser) {
        await NotificationService.sendNotification({
          receiverId: gasPlantUser._id,
          senderId: distributorUser._id,
          title: 'New Order Received',
          message: `New order from ${distributorName} for ${totalKg}kg of gas.`,
          orderId: savedOrder._id,
          type: 'order_placed'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
    
    res.status(201).json({
      success: true,
      msg: 'Order created successfully',
      order: savedOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Order creation failed', 
      error: err.message 
    });
  }
});

// @route   GET api/orders
// @desc    Get all orders for a specific plant by companyEmail and status
// @access  Public (in a real app, this would be protected)
router.get('/', async (req, res) => {
  try {
    const { companyEmail, status } = req.query;
    
    console.log('Fetching orders with companyEmail:', companyEmail, 'status:', status);
    
    if (!companyEmail) {
      return res.status(400).json({ 
        success: false,
        msg: 'Company Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(companyEmail)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid company email format' 
      });
    }

    // Build query
    const query = { companyEmail };
    if (status) {
      // Validate status - using new status values
      const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          msg: 'Invalid status. Must be one of: new, in_progress, completed, cancelled' 
        });
      }
      query.status = status;
    }
    
    console.log('Query object:', query);

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log('Found', orders.length, 'orders');
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Fetching orders failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id
// @desc    Update an order (accept/reject/assign driver/complete/cancel)
// @access  Public (in a real app, this would be protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driverId, driverName } = req.body;

    // Validate status - using new status values
    const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid status. Must be one of: new, in_progress, completed, cancelled' 
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Store previous status for notification logic
    const previousStatus = order.status;

    // Update order fields if provided
    if (status) order.status = status;
    if (driverId !== undefined) order.driverId = driverId;
    if (driverName !== undefined) order.driverName = driverName;

    const updatedOrder = await order.save();
    console.log('Updated order:', updatedOrder);

    // Send notifications based on status change
    try {
      if (status === 'in_progress' && previousStatus !== 'in_progress') {
        // Send notification to Distributor when order is accepted
        const distributorUser = await User.findById(order.distributorId);
        const gasPlantUser = await User.findOne({ email: order.plantEmail });
        
        if (distributorUser && gasPlantUser) {
          await NotificationService.sendNotification({
            receiverId: distributorUser._id,
            senderId: gasPlantUser._id,
            title: 'Order Accepted',
            message: `Your order #${order._id} has been accepted. Please assign a driver.`,
            orderId: order._id,
            type: 'order_accepted'
          });
        }
      } else if (status === 'driver_assigned' && previousStatus !== 'driver_assigned') {
        // Send notification to Gas Plant when driver is assigned
        const distributorUser = await User.findById(order.distributorId);
        const gasPlantUser = await User.findOne({ email: order.plantEmail });
        
        if (distributorUser && gasPlantUser) {
          await NotificationService.sendNotification({
            receiverId: gasPlantUser._id,
            senderId: distributorUser._id,
            title: 'Driver Assigned',
            message: `Driver has been assigned for order #${order._id}.`,
            orderId: order._id,
            type: 'driver_assigned'
          });
        }
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Updating order failed', 
      error: err.message 
    });
  }
});

// @route   GET api/orders/plant/:plantId
// @desc    Get orders for a specific plant
// @access  Public (in a real app, this would be protected)
router.get('/plant/:plantId', async (req, res) => {
  try {
    const { plantId } = req.params;
    
    console.log('Fetching orders for plantId:', plantId);

    const orders = await Order.find({ plantId }).sort({ createdAt: -1 });
    
    console.log('Found', orders.length, 'orders for plantId:', plantId);
    // Log status of each order
    orders.forEach(order => {
      console.log('Order ID:', order._id, 'Status:', order.status);
    });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Fetching orders failed', 
      error: err.message 
    });
  }
});

// @route   GET api/orders/all
// @desc    Get all orders
// @access  Public (in a real app, this would be protected)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Fetching orders failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/accept
// @desc    Accept an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverName } = req.body;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Update order status to in_progress
    order.status = 'in_progress';
    if (driverName) order.driverName = driverName;

    const updatedOrder = await order.save();

    // Send notification to Distributor when order is accepted
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: distributorUser._id,
          senderId: gasPlantUser._id,
          title: 'Order Accepted',
          message: `Your order #${order._id} has been accepted. Please assign a driver.`,
          orderId: order._id,
          type: 'order_accepted'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Order accepted successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Accepting order failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/reject
// @desc    Reject an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Update order status to cancelled (rejected orders are considered cancelled)
    order.status = 'cancelled';

    const updatedOrder = await order.save();

    // Send notification to Distributor when order is rejected
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: distributorUser._id,
          senderId: gasPlantUser._id,
          title: 'Order Rejected',
          message: `Your order #${order._id} has been rejected.`,
          orderId: order._id,
          type: 'order_rejected'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Order rejected successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Rejecting order failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/complete
// @desc    Complete an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Update order status
    order.status = 'completed';

    const updatedOrder = await order.save();

    // Send notification to Distributor when order is completed
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: distributorUser._id,
          senderId: gasPlantUser._id,
          title: 'Order Completed',
          message: `Your order #${order._id} has been completed and is ready for delivery.`,
          orderId: order._id,
          type: 'order_completed'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Order completed successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Completing order failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/cancel
// @desc    Cancel an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Update order status
    order.status = 'cancelled';

    const updatedOrder = await order.save();

    // Send notification to Distributor when order is cancelled
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: distributorUser._id,
          senderId: gasPlantUser._id,
          title: 'Order Cancelled',
          message: `Your order #${order._id} has been cancelled.`,
          orderId: order._id,
          type: 'order_cancelled'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Cancelling order failed', 
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/assign-driver
// @desc    Assign driver to an order
// @access  Public (in a real app, this would be protected)
router.put('/:id/assign-driver', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, driverName } = req.body;

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        msg: 'Order not found' 
      });
    }

    // Update order with driver information
    if (driverId) order.driverId = driverId;
    if (driverName) order.driverName = driverName;
    // Keep the same status (in_progress)
    
    const updatedOrder = await order.save();

    // Send notification to Gas Plant when driver is assigned
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: gasPlantUser._id,
          senderId: distributorUser._id,
          title: 'Driver Assigned',
          message: `Driver has been assigned for order #${order._id}.`,
          orderId: order._id,
          type: 'driver_assigned'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.json({
      success: true,
      msg: 'Driver assigned successfully',
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Assigning driver failed', 
      error: err.message 
    });
  }
});

// @route   GET api/orders/distributor/:distributorEmail
// @desc    Get all orders for a specific distributor by distributorEmail
// @access  Public (in a real app, this would be protected)
router.get('/distributor/:distributorEmail', async (req, res) => {
  try {
    const { distributorEmail } = req.params;
    
    if (!distributorEmail) {
      return res.status(400).json({ 
        success: false,
        msg: 'Distributor Email is required' 
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(distributorEmail)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid distributor email format' 
      });
    }

    // Build query
    const query = { distributorEmail };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: 'Fetching orders failed', 
      error: err.message 
    });
  }
});

// @route   GET api/orders/distributor-id/:distributorId
// @desc    Get all orders for a specific distributor by distributorId
// @access  Public (in a real app, this would be protected)
router.get('/distributor-id/:distributorId', async (req, res) => {
  try {
    const { distributorId } = req.params;
    
    console.log('Fetching orders for distributorId:', distributorId);
    
    if (!distributorId) {
      console.log('Distributor ID is missing');
      return res.status(400).json({ 
        success: false,
        msg: 'Distributor ID is required' 
      });
    }

    // Build query
    const query = { distributorId };
    console.log('Query:', query);

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    // Log the orders for debugging
    console.log(`Found ${orders.length} orders for distributorId: ${distributorId}`);
    // Log just the status and ID of each order for brevity
    orders.forEach(order => {
      console.log(`Order ID: ${order._id}, Status: ${order.status}, DistributorId: ${order.distributorId}`);
    });
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ 
      success: false,
      msg: 'Fetching orders failed', 
      error: err.message 
    });
  }
});

module.exports = router;