const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

console.log('Testing MongoDB connection...');

// Check if MONGO_URI is provided
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('MONGO_URI:', process.env.MONGO_URI);

// Try to connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully!');
  process.exit(0);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});