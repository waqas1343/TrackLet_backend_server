const mongoose = require('mongoose');

const gasPlantSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    totalCapacity: {
      type: Number,
      default: 0, // in KG
    },
    currentStock: {
      type: Number,
      default: 0, // in KG
    },
    perKgPrice: {
      type: Number,
      default: 250,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/400x200?text=Gas+Plant',
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

// Add indexes for better query performance
gasPlantSchema.index({ ownerEmail: 1 });
gasPlantSchema.index({ companyEmail: 1 });
gasPlantSchema.index({ status: 1 });

console.log('Compiling GasPlant model...');

module.exports = mongoose.model('GasPlant', gasPlantSchema);

