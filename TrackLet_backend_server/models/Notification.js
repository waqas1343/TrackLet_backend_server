const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  orderId: {
    type: String, // Changed from ObjectId to String to match Order model
    default: null,
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  type: {
    type: String,
    enum: ['order_placed', 'order_accepted', 'driver_assigned', 'order_completed', 'order_rejected', 'order_cancelled', 'general'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes
notificationSchema.index({ receiverId: 1 });
notificationSchema.index({ senderId: 1 });
notificationSchema.index({ orderId: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);