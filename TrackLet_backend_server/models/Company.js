const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ownerEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
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

// Add indexes
companySchema.index({ ownerEmail: 1 });
companySchema.index({ ownerUserId: 1 });
companySchema.index({ createdBy: 1 });

// Ensure name is unique
companySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Company', companySchema);
