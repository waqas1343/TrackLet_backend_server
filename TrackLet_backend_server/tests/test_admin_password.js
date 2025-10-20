require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Test super admin password verification
const testAdminPassword = async () => {
  try {
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super admin not found:', 'agha@tracklet.com');
      mongoose.connection.close();
      return;
    }

    console.log('Super admin found:', superAdmin.email);
    console.log('Password hash:', superAdmin.password);
    
    // Test password verification with "123123"
    const isMatch123123 = await bcrypt.compare('123123', superAdmin.password);
    console.log('Password "123123" match result:', isMatch123123);
    
    // Test password verification with "admin123"
    const isMatchAdmin123 = await bcrypt.compare('admin123', superAdmin.password);
    console.log('Password "admin123" match result:', isMatchAdmin123);
    
    // Test password verification with "tracklet123"
    const isMatchTracklet123 = await bcrypt.compare('tracklet123', superAdmin.password);
    console.log('Password "tracklet123" match result:', isMatchTracklet123);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error testing super admin password:', err);
    mongoose.connection.close();
  }
};

testAdminPassword();