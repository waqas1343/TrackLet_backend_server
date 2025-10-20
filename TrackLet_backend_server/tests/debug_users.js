require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Connect to database
connectDB();

const User = require('../models/User');

// Check users with details
const checkUsers = async () => {
  try {
    const users = await User.find({}).select('+password');
    
    console.log(`Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Status: ${user.status}`);
      console.log(`  Created By: ${user.createdBy}`);
      console.log(`  Created At: ${user.createdAt}`);
      console.log(`  Has Password: ${!!user.password}`);
      if (user.password) {
        console.log(`  Password Length: ${user.password.length}`);
        console.log(`  Password Type: ${typeof user.password}`);
      }
    });
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error checking users:', err);
    mongoose.connection.close();
  }
};

checkUsers();