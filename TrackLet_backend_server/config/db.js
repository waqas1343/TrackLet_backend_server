const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    // Removed console.log statements
    
    // Log the connection string (mask sensitive info in production)
    if (process.env.NODE_ENV !== 'production') {
      // Removed console.log statements
    }
    
    // Use the MONGO_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Removed console.log statements
    // Removed console.log statements
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      // Removed console.log statements
    });
    
    mongoose.connection.on('disconnected', () => {
      // Removed console.log statements
    });
    
    return conn;
  } catch (error) {
    // Removed console.log statements
    // Removed console.log statements
    // Don't exit the process in production, let the application handle it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error; // Re-throw for the application to handle
  }
};

module.exports = connectDB;