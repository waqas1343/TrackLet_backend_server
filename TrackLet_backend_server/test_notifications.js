const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Test notification functionality
async function testNotifications() {
  try {
    console.log('Testing notification system...');
    
    // Import models
    const User = require('./models/User');
    const Notification = require('./models/Notification');
    const NotificationService = require('./services/notificationService');
    
    // Find test users
    const gasPlantUser = await User.findOne({ role: 'gas_plant' });
    const distributorUser = await User.findOne({ role: 'distributor' });
    
    if (!gasPlantUser || !distributorUser) {
      console.log('Test users not found. Please create test users first.');
      process.exit(1);
    }
    
    console.log(`Gas Plant User: ${gasPlantUser.email} (${gasPlantUser._id})`);
    console.log(`Distributor User: ${distributorUser.email} (${distributorUser._id})`);
    
    // Test sending notification
    console.log('\n--- Sending test notification ---');
    const notification = await NotificationService.sendNotification({
      receiverId: distributorUser._id,
      senderId: gasPlantUser._id,
      title: 'Test Notification',
      message: 'This is a test notification from the Tracklet system.',
      type: 'general'
    });
    
    console.log('Notification sent successfully:', notification);
    
    // Test getting user notifications
    console.log('\n--- Getting user notifications ---');
    const notifications = await NotificationService.getUserNotifications(distributorUser._id);
    console.log(`Found ${notifications.length} notifications for user ${distributorUser.email}`);
    
    // Test getting unread count
    console.log('\n--- Getting unread count ---');
    const unreadCount = await NotificationService.getUnreadCount(distributorUser._id);
    console.log(`Unread notifications: ${unreadCount}`);
    
    // Test marking as read
    if (notifications.length > 0) {
      console.log('\n--- Marking notification as read ---');
      const markedRead = await NotificationService.markAsRead(notifications[0]._id);
      console.log('Notification marked as read:', markedRead.title);
      
      // Check unread count again
      const newUnreadCount = await NotificationService.getUnreadCount(distributorUser._id);
      console.log(`New unread count: ${newUnreadCount}`);
    }
    
    console.log('\n--- Test completed successfully ---');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

testNotifications();