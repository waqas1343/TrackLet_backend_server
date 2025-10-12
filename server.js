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

// Database connection with error handling
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    // In production, we might want to continue running the server for health checks
    if (process.env.NODE_ENV === 'production') {
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
    database: dbConnected ? 'Connected' : 'Disconnected'
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
    res.send('Tracklet Pro API is running in development mode...');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Use the PORT environment variable provided by Vercel, or default to 10000
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });
});