const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['gas_plant', 'distributor'],
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profileImageUrl: {
    type: String,
    default: '',
  },
  password: {
    type: String,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from 'SuperAdmin' to 'User' since distributors can create drivers
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified and not empty
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ createdBy: 1 });

module.exports = mongoose.model('User', userSchema);


