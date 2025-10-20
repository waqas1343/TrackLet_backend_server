require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const User = require('./models/User');
const SuperAdmin = require('./models/SuperAdmin');

// Test user creation
const testUserCreation = async () => {
  try {
    // First, find the super admin to use as createdBy
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super Admin not found.');
      mongoose.connection.close();
      return;
    }

    console.log('Super Admin found:', superAdmin.email);
    console.log('Super Admin ID:', superAdmin._id);

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@example.com' });
    if (existingUser) {
      console.log('Test user already exists, deleting...');
      await User.deleteOne({ email: 'testuser@example.com' });
    }

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123123', salt);

    // Create new test user
    const newUser = new User({
      email: 'testuser@example.com',
      password: hashedPassword,
      role: 'distributor',
      name: 'Test User',
      createdBy: superAdmin._id
    });

    console.log('Attempting to save user...');
    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser.email);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating test user:', err);
    mongoose.connection.close();
  }
};

testUserCreation();