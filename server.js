require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables for debugging (remove in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PORT:', process.env.PORT);
  console.log('- MONGO_URI:', process.env.MONGO_URI ? '*** EXISTS ***' : 'MISSING');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '*** EXISTS ***' : 'MISSING');
}

// Database connection with error handling
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    // In production, we might want to continue running the server for health checks
    if (process.env.NODE_ENV !== 'production') {
      dbConnected = false;
    }
  });

// Define routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
} else {
  // Basic route for development
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Tracklet Pro API is running in development mode',
      database: dbConnected ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  console.error('========================');
  
  // Send detailed error in development, generic message in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ msg: 'Something broke!' });
  } else {
    res.status(500).json({ 
      msg: 'Something broke!',
      error: err.message,
      stack: err.stack
    });
  }
});

// Use the PORT environment variable provided by Vercel, or default to 10000
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('=== UNHANDLED PROMISE REJECTION ===');
  console.log('Reason:', err.message);
  console.log('Promise:', promise);
  console.log('====================================');
  
  // Close server & exit process in development, but not in production
  if (process.env.NODE_ENV !== 'production') {
    server.close(() => process.exit(1));
  }
});