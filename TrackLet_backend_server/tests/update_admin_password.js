require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Update password for super admin user
const updateSuperAdminPassword = async () => {
  try {
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super admin not found:', 'agha@tracklet.com');
      mongoose.connection.close();
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123123', salt);

    // Update password
    superAdmin.password = hashedPassword;
    await superAdmin.save();

    console.log('Super admin password updated successfully for:', superAdmin.email);
    console.log('New password: 123123');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating super admin password:', err);
    mongoose.connection.close();
  }
};

updateSuperAdminPassword();