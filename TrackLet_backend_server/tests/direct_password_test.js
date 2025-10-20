require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Direct password test
const directPasswordTest = async () => {
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
    
    // Test direct bcrypt comparison
    const directResult = await bcrypt.compare('123123', superAdmin.password);
    console.log('Direct bcrypt.compare result:', directResult);
    
    // Test using the model's method
    const modelResult = await superAdmin.comparePassword('123123');
    console.log('Model comparePassword result:', modelResult);
    
    // Let's also try setting a new password directly and testing it
    console.log('\n--- Setting new password directly ---');
    const newPassword = '123123';
    const newHash = await bcrypt.hash(newPassword, 10);
    console.log('New hash:', newHash);
    
    const directTest = await bcrypt.compare(newPassword, newHash);
    console.log('Direct comparison of new hash:', directTest);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error in direct password test:', err);
    mongoose.connection.close();
  }
};

directPasswordTest();