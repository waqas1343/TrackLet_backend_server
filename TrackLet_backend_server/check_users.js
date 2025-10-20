require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const User = require('./models/User');

// Check if any users exist and show details
User.find({})
  .then(users => {
    if (users.length > 0) {
      console.log('Users found in database:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, ID: ${user._id}`);
      });
      console.log(`Total users: ${users.length}`);
    } else {
      console.log('No users found in database');
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.log('Error checking users:', err.message);
    mongoose.connection.close();
  });