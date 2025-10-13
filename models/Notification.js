const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      default: '',
    },
    driverId: {
      type: String,
      default: '',
    },
    driverName: {
      type: String,
      default: '',
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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
notificationSchema.index({ receiverId: 1, status: 1 });
notificationSchema.index({ senderId: 1 });
notificationSchema.index({ orderId: 1 });
notificationSchema.index({ date: -1 });

console.log('Compiling Notification model...');

module.exports = mongoose.model('Notification', notificationSchema);

