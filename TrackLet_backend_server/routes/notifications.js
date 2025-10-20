const express = require('express');
const router = express.Router();
const { 
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
} = require('../controllers/notificationsController');

const { userAuth } = require('./login');

// POST /api/notifications/send - Send a new notification
router.post('/send', userAuth, sendNotification);

// GET /api/notifications/:userId - Get all notifications for a user
router.get('/:userId', userAuth, getUserNotifications);

// PATCH /api/notifications/:notificationId/read - Mark a notification as read
router.patch('/:notificationId/read', userAuth, markAsRead);

// PATCH /api/notifications/:userId/read-all - Mark all notifications as read for a user
router.patch('/:userId/read-all', userAuth, markAllAsRead);

// GET /api/notifications/:userId/unread-count - Get unread notification count for a user
router.get('/:userId/unread-count', userAuth, getUnreadCount);

// DELETE /api/notifications/:notificationId - Delete a notification
router.delete('/:notificationId', userAuth, deleteNotification);

module.exports = router;

