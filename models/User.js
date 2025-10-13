const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'gas_plant', 'distributor'],
      default: 'user',
    },
    bio: {
      type: String,
      default: '',
    },
    profileImageUrl: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    plantId: {
      type: String,
      default: null,
      sparse: true, // Allows null values and indexes only non-null
    },
    createdBy: {
      type: String,
      default: null, // Super Admin ID who created this user
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
userSchema.index({ email: 1 });

// Log when the model is compiled
console.log('Compiling User model...');

module.exports = mongoose.model('User', userSchema);