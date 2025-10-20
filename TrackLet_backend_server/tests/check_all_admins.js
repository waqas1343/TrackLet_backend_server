require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Check all super admin users
SuperAdmin.find({})
  .then(admins => {
    if (admins.length > 0) {
      // Removed console.log statements
      admins.forEach(admin => {
        // Removed console.log statements
      });
    } else {
      // Removed console.log statements
    }
    mongoose.connection.close();
  })
  .catch(err => {
    // Removed console.log statements
    mongoose.connection.close();
  });