const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Maintenance', 'Utilities', 'Salaries', 'Transport', 'Supplies', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Cheque', 'Other'],
      default: 'Cash',
    },
    userId: {
      type: String,
      required: true,
    },
    plantId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
expenseSchema.index({ userId: 1 });
expenseSchema.index({ plantId: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

console.log('Compiling Expense model...');

module.exports = mongoose.model('Expense', expenseSchema);

