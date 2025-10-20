require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const User = require('./models/User');
const SuperAdmin = require('./models/SuperAdmin');

// Create a test driver user
const createTestDriver = async () => {
  try {
    // First, find the super admin to use as createdBy
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super Admin not found. Please create a super admin first.');
      mongoose.connection.close();
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'driver1@tracklet.com' });
    if (existingUser) {
      console.log('Test driver already exists:', existingUser.email);
      mongoose.connection.close();
      return;
    }

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('tracklet123', salt);

    // Create new user
    const newUser = new User({
      email: 'driver1@tracklet.com',
      password: hashedPassword,
      role: 'distributor', // Valid role from the enum
      name: 'Test Driver',
      createdBy: superAdmin._id // Reference to the super admin
    });

    const savedUser = await newUser.save();
    console.log('Test driver created successfully:', savedUser.email);
    console.log('Default password: tracklet123');
    console.log('You can now log in to the tracklet_pro app with these credentials');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating test driver:', err);
    mongoose.connection.close();
  }
};

createTestDriver();