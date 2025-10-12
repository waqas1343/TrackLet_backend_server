const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    // Use the MONGO_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Don't exit the process in production, let the application handle it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error; // Re-throw for the application to handle
  }
};

module.exports = connectDB;