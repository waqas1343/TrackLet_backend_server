require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Create a super admin user
const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (existingAdmin) {
      console.log('Super admin already exists:', existingAdmin.email);
      mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create new super admin
    const newSuperAdmin = new SuperAdmin({
      email: 'agha@tracklet.com',
      password: hashedPassword,
      name: 'Agha Admin'
    });

    const savedAdmin = await newSuperAdmin.save();
    console.log('Super admin created successfully:', savedAdmin.email);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating super admin:', err);
    mongoose.connection.close();
  }
};

createSuperAdmin();