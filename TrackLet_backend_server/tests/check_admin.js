require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Check if super admin user exists
SuperAdmin.findOne({email: 'admin@tracklet.com'})
  .then(user => {
    if (user) {
      // Removed console.log statements
      // Removed console.log statements
    } else {
      // Removed console.log statements
    }
    mongoose.connection.close();
  })
  .catch(err => {
    // Removed console.log statements
    mongoose.connection.close();
  });