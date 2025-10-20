require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Directly set password for super admin user without triggering hooks
const directSetPassword = async () => {
  try {
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super admin not found:', 'agha@tracklet.com');
      mongoose.connection.close();
      return;
    }

    // Hash password directly
    const saltRounds = 10;
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password using findByIdAndUpdate to bypass hooks
    const updatedAdmin = await SuperAdmin.findByIdAndUpdate(
      superAdmin._id,
      { password: hashedPassword },
      { new: true, runValidators: false }
    );

    console.log('Super admin password set successfully for:', updatedAdmin.email);
    console.log('New password hash:', updatedAdmin.password);
    
    // Test the password verification
    const isMatch = await bcrypt.compare(password, updatedAdmin.password);
    console.log('Direct bcrypt comparison result:', isMatch);
    
    // Also test using the model's method
    const modelMatch = await updatedAdmin.comparePassword(password);
    console.log('Model comparePassword result:', modelMatch);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error setting super admin password:', err);
    mongoose.connection.close();
  }
};

directSetPassword();