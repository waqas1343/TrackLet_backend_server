const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Driver', 'Manager', 'Technician', 'Supervisor', 'Worker', 'Other'],
      default: 'Worker',
    },
    licenseNumber: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    salary: {
      type: Number,
      default: 0,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    employerId: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    profileImageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
employeeSchema.index({ employerId: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 1 });

console.log('Compiling Employee model...');

module.exports = mongoose.model('Employee', employeeSchema);

