const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    distributorId: {
      type: String,
      required: true,
    },
    distributorName: {
      type: String,
      required: true,
    },
    distributorEmail: {
      type: String,
      required: true,
    },
    plantId: {
      type: String,
      required: true,
    },
    plantName: {
      type: String,
      required: true,
    },
    plantEmail: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
    },
    plantImageUrl: {
      type: String,
      required: true,
    },
    items: [orderItemSchema],
    specialInstructions: {
      type: String,
      default: '',
    },
    totalKg: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'completed', 'cancelled'],
      default: 'new',
    },
    driverName: {
      type: String,
      default: null,
    },
    driverId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
orderSchema.index({ distributorId: 1 });
orderSchema.index({ plantId: 1 });
orderSchema.index({ plantEmail: 1 });
orderSchema.index({ companyEmail: 1 });
orderSchema.index({ status: 1 });

// Log when the model is compiled
console.log('Compiling Order model...');

module.exports = mongoose.model('Order', orderSchema);