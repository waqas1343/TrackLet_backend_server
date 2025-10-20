const Notification = require('../models/Notification');
const { getIO } = require('../utils/socket');

class NotificationService {
  // Send notification to a user
  static async sendNotification({
    receiverId,
    senderId,
    title,
    message,
    orderId = null,
    type
  }) {
    try {
      // Create notification
      const notification = new Notification({
        receiverId,
        senderId,
        title,
        message,
        orderId: orderId ? orderId.toString() : null, // Ensure it's a string
        type,
      });

      // Save notification
      const savedNotification = await notification.save();

      // Populate sender info for response
      await savedNotification.populate('senderId', 'name email');

      // Emit real-time notification via Socket.io (if available)
      try {
        const io = getIO();
        if (io) {
          io.to(receiverId.toString()).emit('newNotification', savedNotification);
        }
      } catch (socketError) {
        // Socket.io not initialized, but that's okay for non-real-time environments
        console.log('Socket.io not available for real-time notifications');
      }

      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId) {
    try {
      const notifications = await Notification.find({ receiverId: userId })
        .populate('senderId', 'name email')
        .sort({ timestamp: -1 });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { status: 'read' },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { receiverId: userId, status: 'unread' },
        { status: 'read' }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        receiverId: userId,
        status: 'unread',
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;