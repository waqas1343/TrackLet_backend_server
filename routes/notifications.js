const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @route   POST api/notifications/send
// @desc    Send notification to a user
// @access  Public (in real app, should be protected)
router.post('/send', async (req, res) => {
  try {
    const { senderId, senderName, receiverId, message, orderId, driverId, driverName, type } = req.body;

    console.log('Backend: Sending notification from', senderName, 'to', receiverId);

    // Validate required fields
    if (!senderId || !senderName || !receiverId || !message || !type) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Create notification
    const notification = new Notification({
      senderId,
      senderName,
      receiverId,
      message,
      orderId: orderId || '',
      driverId: driverId || '',
      driverName: driverName || '',
      type,
      status: 'unread',
      date: new Date(),
    });

    const savedNotification = await notification.save();
    console.log('Backend: Notification sent successfully');

    res.json(savedNotification);
  } catch (err) {
    console.error('Sending notification error:', err.message);
    res.status(500).json({ msg: 'Sending notification failed', error: err.message });
  }
});

// @route   GET api/notifications/:receiverId
// @desc    Get all notifications for a user
// @access  Public
router.get('/:receiverId', async (req, res) => {
  try {
    const { receiverId } = req.params;
    console.log('Backend: Fetching notifications for receiverId:', receiverId);

    const notifications = await Notification.find({ receiverId }).sort({ date: -1 });
    console.log('Backend: Found', notifications.length, 'notifications');

    res.json(notifications);
  } catch (err) {
    console.error('Fetching notifications error:', err.message);
    res.status(500).json({ msg: 'Fetching notifications failed', error: err.message });
  }
});

// @route   PATCH api/notifications/:id/read
// @desc    Mark notification as read
// @access  Public
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Marking notification as read:', id);

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    notification.status = 'read';
    const updatedNotification = await notification.save();

    console.log('Backend: Notification marked as read');
    res.json(updatedNotification);
  } catch (err) {
    console.error('Marking notification as read error:', err.message);
    res.status(500).json({ msg: 'Marking notification failed', error: err.message });
  }
});

// @route   GET api/notifications/:receiverId/unread-count
// @desc    Get unread notification count
// @access  Public
router.get('/:receiverId/unread-count', async (req, res) => {
  try {
    const { receiverId } = req.params;
    const count = await Notification.countDocuments({ receiverId, status: 'unread' });

    res.json({ count });
  } catch (err) {
    console.error('Getting unread count error:', err.message);
    res.status(500).json({ msg: 'Getting unread count failed', error: err.message });
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete notification
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Deleting notification:', id);

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    console.log('Backend: Notification deleted successfully');
    res.json({ msg: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Deleting notification error:', err.message);
    res.status(500).json({ msg: 'Deleting notification failed', error: err.message });
  }
});

module.exports = router;

