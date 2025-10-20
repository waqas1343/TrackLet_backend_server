require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const User = require('./models/User');

// Check if any users exist
User.find({})
  .then(users => {
    if (users.length > 0) {
      // Removed console.log statements
      users.forEach(user => {
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