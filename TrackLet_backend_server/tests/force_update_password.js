require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Force update password without triggering hooks
const forceUpdatePassword = async () => {
  try {
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super admin not found:', 'agha@tracklet.com');
      mongoose.connection.close();
      return;
    }

    console.log('Super admin found:', superAdmin.email);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123123', salt);
    
    console.log('New password hash:', hashedPassword);
    
    // Update password using findByIdAndUpdate to bypass pre-save hooks
    const updatedAdmin = await SuperAdmin.findByIdAndUpdate(
      superAdmin._id,
      { password: hashedPassword },
      { new: true, runValidators: false }
    );
    
    console.log('Password updated successfully for:', updatedAdmin.email);
    
    // Test the new password
    const isMatch = await bcrypt.compare('123123', updatedAdmin.password);
    console.log('Password verification result:', isMatch);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error force updating password:', err);
    mongoose.connection.close();
  }
};

forceUpdatePassword();