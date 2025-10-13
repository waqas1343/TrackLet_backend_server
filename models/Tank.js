const mongoose = require('mongoose');

const tankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    totalCapacity: {
      type: Number,
      required: true, // in tons
    },
    available: {
      type: Number,
      default: 0, // in tons
    },
    freezeGas: {
      type: Number,
      default: 0, // in tons
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Maintenance'],
      default: 'Active',
    },
    ownerId: {
      type: String,
      required: true, // Gas Plant user ID
    },
    lastRecordedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
tankSchema.index({ ownerId: 1 });
tankSchema.index({ status: 1 });

console.log('Compiling Tank model...');

module.exports = mongoose.model('Tank', tankSchema);

