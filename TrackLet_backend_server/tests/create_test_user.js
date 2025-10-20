require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const User = require('./models/User');
const SuperAdmin = require('./models/SuperAdmin');

// Create a test user for tracklet_pro app
const createTestUser = async () => {
  try {
    // First, find the super admin to use as createdBy
    const superAdmin = await SuperAdmin.findOne({ email: 'admin@tracklet.com' });
    if (!superAdmin) {
      console.log('Super Admin not found. Please create a super admin first.');
      mongoose.connection.close();
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'p@tracklet.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create new user
    const newUser = new User({
      email: 'p@tracklet.com',
      password: hashedPassword,
      role: 'distributor', // Valid role from the enum
      name: 'Test Distributor',
      createdBy: superAdmin._id // Reference to the super admin
    });

    const savedUser = await newUser.save();
    console.log('Test user created successfully:', savedUser.email);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating test user:', err);
    mongoose.connection.close();
  }
};

createTestUser();