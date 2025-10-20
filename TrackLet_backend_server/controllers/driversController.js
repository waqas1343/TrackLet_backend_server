const User = require('../models/User');
const Order = require('../models/Order');
const NotificationService = require('../services/notificationService');

// Get all drivers for a distributor
const getDistributorDrivers = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const authenticatedUser = req.user;

    // Verify that the authenticated user is the same as the requested distributor
    if (authenticatedUser.id !== distributorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own drivers.' 
      });
    }

    // Find all users with role 'distributor' and createdBy = distributorId
    // In this system, drivers are stored as users with role 'distributor' 
    // and are created by the main distributor
    const drivers = await User.find({ 
      role: 'distributor',
      createdBy: distributorId
    }).select('id name email phoneNumber');

    // Transform drivers to match frontend model
    const transformedDrivers = drivers.map(driver => ({
      id: driver._id.toString(),
      name: driver.name,
      status: 'Available', // Default status
      description: driver.phoneNumber ? `Phone: ${driver.phoneNumber}` : 'No phone provided',
      showAvatar: true,
      rating: 0.0,
      deliveries: 0
    }));

    res.status(200).json({
      success: true,
      drivers: transformedDrivers,
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching drivers' 
    });
  }
};

// Assign driver to order
const assignDriverToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;
    const authenticatedUser = req.user;

    console.log('Assigning driver to order:', { orderId, driverId, authenticatedUser });

    // Validate required fields
    if (!driverId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver ID is required' 
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    console.log('Found order:', order);

    // Check if order is in accepted or driver_assigned state
    if (order.status !== 'accepted' && order.status !== 'driver_assigned') {
      console.log('Order status not valid for driver assignment:', order.status);
      return res.status(400).json({ 
        success: false, 
        message: 'Order must be accepted or already have a driver assigned to reassign a new driver' 
      });
    }

    // Find driver
    const driver = await User.findById(driverId);
    if (!driver) {
      console.log('Driver not found:', driverId);
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }

    console.log('Found driver:', driver);

    // Check if driver belongs to the same distributor
    if (driver.createdBy.toString() !== order.distributorId.toString()) {
      console.log('Driver does not belong to distributor:', { 
        driverCreatedBy: driver.createdBy.toString(), 
        orderDistributorId: order.distributorId.toString() 
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Driver does not belong to this distributor' 
      });
    }

    // Verify that the authenticated user is the distributor who owns this order
    if (authenticatedUser.id !== order.distributorId.toString()) {
      console.log('Authenticated user does not own order:', { 
        authenticatedUserId: authenticatedUser.id, 
        orderDistributorId: order.distributorId.toString() 
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only assign drivers to your own orders.' 
      });
    }

    // Update order with driver information
    order.driverId = driverId;
    order.driverName = driver.name;
    order.status = 'driver_assigned';

    const updatedOrder = await order.save();

    console.log('Order updated successfully:', updatedOrder);

    // Send notification to Gas Plant when driver is assigned
    try {
      const distributorUser = await User.findById(order.distributorId);
      const gasPlantUser = await User.findOne({ email: order.plantEmail });
      
      if (distributorUser && gasPlantUser) {
        await NotificationService.sendNotification({
          receiverId: gasPlantUser._id,
          senderId: distributorUser._id,
          title: 'Driver Assigned',
          message: `Driver ${driver.name} has been assigned for order #${order._id}.`,
          orderId: order._id,
          type: 'driver_assigned'
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while assigning driver' 
    });
  }
};

// Get driver orders
const getDriverOrders = async (req, res) => {
  try {
    const { driverId } = req.params;
    const authenticatedUser = req.user;

    // Find the driver to verify ownership
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }

    // Verify that the authenticated user is the distributor who created this driver
    if (driver.createdBy.toString() !== authenticatedUser.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view orders for drivers you created.' 
      });
    }

    // Find orders assigned to this driver
    const orders = await Order.find({ 
      driverId,
      status: { $in: ['driver_assigned', 'completed'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching driver orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching driver orders' 
    });
  }
};

// Create a new driver
const createDriver = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const authenticatedUser = req.user;

    console.log('Creating driver with data:', { name, phoneNumber });
    console.log('Authenticated user:', authenticatedUser);

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

    // Check if user is authenticated
    if (!authenticatedUser || !authenticatedUser.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Use the authenticated user's ID as the distributorId
    const distributorId = authenticatedUser.id;

    // Generate a dummy email if not provided
    const email = phoneNumber ? `driver_${phoneNumber}@tracklet.com` : `driver_${Date.now()}@tracklet.com`;

    console.log('Generated email:', email);

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user with this email already exists' 
      });
    }

    // Create new driver (stored as a User with role 'distributor')
    const newDriver = new User({
      name,
      email,
      phoneNumber: phoneNumber || '',
      role: 'distributor',
      createdBy: distributorId, // This should be the ObjectId of the distributor
      password: 'tracklet123' // Default password, should be changed by user
    });

    console.log('Driver object to save:', newDriver);

    const savedDriver = await newDriver.save();

    console.log('Driver saved successfully:', savedDriver);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      driver: {
        id: savedDriver._id,
        name: savedDriver.name,
        status: 'Available', // Default status
        description: phoneNumber ? `Phone: ${phoneNumber}` : 'No phone provided',
        showAvatar: true,
        rating: 0.0,
        deliveries: 0,
        email: savedDriver.email,
        phoneNumber: savedDriver.phoneNumber
      },
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    // More detailed error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error: ' + messages.join(', ')
      });
    }
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user with this email or phone number already exists'
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating driver: ' + error.message
    });
  }
};

module.exports = {
  getDistributorDrivers,
  assignDriverToOrder,
  getDriverOrders,
  createDriver
};