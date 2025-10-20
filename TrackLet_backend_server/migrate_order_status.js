const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Migration function
const migrateOrderStatus = async () => {
  try {
    await connectDB();
    
    // Find all orders with old status values
    const orders = await Order.find({
      status: { $in: ['pending', 'accepted', 'rejected', 'driver_assigned'] }
    });
    
    console.log(`Found ${orders.length} orders with old status values`);
    
    // Update each order with new status values
    for (const order of orders) {
      let newStatus = order.status;
      
      // Map old status values to new ones
      switch (order.status) {
        case 'pending':
          newStatus = 'new';
          break;
        case 'accepted':
          newStatus = 'in_progress';
          break;
        case 'rejected':
          newStatus = 'cancelled';
          break;
        case 'driver_assigned':
          newStatus = 'in_progress';
          break;
        default:
          newStatus = order.status;
      }
      
      // Update the order
      order.status = newStatus;
      await order.save();
      console.log(`Updated order ${order._id} from ${order.status} to ${newStatus}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateOrderStatus();