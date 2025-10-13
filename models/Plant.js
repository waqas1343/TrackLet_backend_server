const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    perKgPrice: {
      type: Number,
      required: true,
      default: 250,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/400x200?text=Gas+Plant',
    },
    totalCapacity: {
      type: Number,
      default: 0, // in KG
    },
    currentStock: {
      type: Number,
      default: 0, // in KG
    },
    ownerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
plantSchema.index({ ownerId: 1 });
plantSchema.index({ city: 1 });
plantSchema.index({ status: 1 });

console.log('Compiling Plant model...');

module.exports = mongoose.model('Plant', plantSchema);

