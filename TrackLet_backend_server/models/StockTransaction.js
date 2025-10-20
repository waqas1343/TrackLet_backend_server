const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    tankId: {
      type: String,
      required: true,
    },
    tankName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['add', 'deduct', 'freeze', 'unfreeze'],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // in tons
    },
    rate: {
      type: Number,
      default: 0, // per kg rate at time of transaction
    },
    orderId: {
      type: String,
      default: '', // If transaction is from order
    },
    ownerId: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
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
stockTransactionSchema.index({ tankId: 1 });
stockTransactionSchema.index({ ownerId: 1 });
stockTransactionSchema.index({ type: 1 });
stockTransactionSchema.index({ date: -1 });

console.log('Compiling StockTransaction model...');

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);

