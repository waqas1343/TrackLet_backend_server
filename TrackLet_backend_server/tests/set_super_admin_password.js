require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Set a specific password for super admin user
const setSuperAdminPassword = async () => {
  try {
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    if (!superAdmin) {
      console.log('Super admin not found:', 'agha@tracklet.com');
      mongoose.connection.close();
      return;
    }

    // Use a fixed salt to ensure consistent hashing
    const saltRounds = 10;
    const password = 'admin123';
    
    // Hash password with a fixed salt
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    superAdmin.password = hashedPassword;
    await superAdmin.save();

    console.log('Super admin password set successfully for:', superAdmin.email);
    console.log('New password hash:', hashedPassword);
    console.log('Test verification:');
    
    // Test the password verification
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password verification result:', isMatch);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error setting super admin password:', err);
    mongoose.connection.close();
  }
};

setSuperAdminPassword();