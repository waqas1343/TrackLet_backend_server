const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

// Send notification
const sendNotification = async (req, res) => {
  try {
    const { receiverId, senderId, title, message, orderId, type } = req.body;

    // Validate required fields
    if (!receiverId || !senderId || !title || !message || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create notification
    const notification = new Notification({
      receiverId,
      senderId,
      title,
      message,
      orderId: orderId || null,
      type,
    });

    // Save notification
    const savedNotification = await notification.save();

    // Populate sender info for response
    await savedNotification.populate('senderId', 'name email');

    // Emit real-time notification via Socket.io
    const io = getIO();
    if (io) {
      io.to(receiverId.toString()).emit('newNotification', savedNotification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      notification: savedNotification,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending notification' 
    });
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Get notifications for user, sorted by timestamp (newest first)
    const notifications = await Notification.find({ receiverId: userId })
      .populate('senderId', 'name email')
      .populate('orderId', 'id')
      .sort({ timestamp: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching notifications' 
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Validate notification ID
    if (!notificationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Notification ID is required' 
      });
    }

    // Update notification status
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while marking notification as read' 
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Update all unread notifications for user
    const result = await Notification.updateMany(
      { receiverId: userId, status: 'unread' },
      { status: 'read' }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while marking all notifications as read' 
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Count unread notifications
    const count = await Notification.countDocuments({
      receiverId: userId,
      status: 'unread',
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while getting unread count' 
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Validate notification ID
    if (!notificationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Notification ID is required' 
      });
    }

    // Delete notification
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting notification' 
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};