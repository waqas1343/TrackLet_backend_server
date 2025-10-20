const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const loginRoutes = require('./routes/login');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const gasPlantRoutes = require('./routes/gasPlants'); // Import gasPlants routes
const orderRoutes = require('./routes/orders'); // Import orders routes
const rateRoutes = require('./routes/rates'); // Import rates routes
const tankRoutes = require('./routes/tanks'); // Import tanks routes
const expenseRoutes = require('./routes/expenses'); // Import expenses routes
const notificationRoutes = require('./routes/notifications'); // Import notifications routes
const driverRoutes = require('./routes/drivers'); // Import drivers routes
const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Database connection
connectDB();

// Routes - Order matters! More specific routes should come before general ones
// Move loginRoutes before userRoutes to avoid conflicts
app.use('/api', loginRoutes); // Register login routes first to handle /api/users/profile
app.use('/api/gasPlants', gasPlantRoutes); // Register gasPlants routes first (more specific)
app.use('/api/tanks', tankRoutes); // Register tanks routes
app.use('/api/expenses', expenseRoutes); // Register expenses routes
app.use('/api/orders', orderRoutes); // Register orders routes
app.use('/api/rates', rateRoutes); // Register rates routes
app.use('/api/super-admin', authRoutes);
app.use('/api/users', userRoutes); // Register user routes after login routes
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes); // Register notifications routes
app.use('/api/drivers', driverRoutes); // Register drivers routes

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tracklet Backend Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found' 
  });
});

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Listen on all available network interfaces to allow connections from physical devices
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on all network interfaces on port ${PORT}`);
  console.log(`Access the server from this machine at: http://localhost:${PORT}`);
  console.log(`Access the server from other devices on the same network using your machine's IP address and port ${PORT}`);
});