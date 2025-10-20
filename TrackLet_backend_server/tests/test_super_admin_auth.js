require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const SuperAdmin = require('./models/SuperAdmin');

// Test super admin authentication
const testSuperAdminAuth = async () => {
  try {
    console.log('Testing super admin authentication for: agha@tracklet.com');
    
    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ email: 'agha@tracklet.com' });
    console.log('Super admin found:', superAdmin ? 'Yes' : 'No');
    
    if (!superAdmin) {
      console.log('Super admin not found in database');
      mongoose.connection.close();
      return;
    }
    
    console.log('Super admin details:');
    console.log('- Email:', superAdmin.email);
    console.log('- Name:', superAdmin.name);
    console.log('- Password hash:', superAdmin.password);
    console.log('- Role:', superAdmin.role);
    console.log('- Created at:', superAdmin.createdAt);
    
    // Test password verification with correct password
    const correctPassword = 'admin123';
    console.log('\nTesting password verification with correct password:', correctPassword);
    const isMatchCorrect = await superAdmin.comparePassword(correctPassword);
    console.log('Password match result:', isMatchCorrect);
    
    // Test password verification with incorrect password
    const incorrectPassword = 'wrongpassword';
    console.log('\nTesting password verification with incorrect password:', incorrectPassword);
    const isMatchIncorrect = await superAdmin.comparePassword(incorrectPassword);
    console.log('Password match result:', isMatchIncorrect);
    
    // If correct password matches, test JWT token generation
    if (isMatchCorrect) {
      console.log('\nGenerating JWT token...');
      const payload = {
        superAdmin: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role,
        },
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      console.log('JWT token generated successfully');
      console.log('Token length:', token.length);
      
      // Test token verification
      console.log('\nVerifying JWT token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully');
      console.log('Decoded payload:', decoded);
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error testing super admin authentication:', err);
    mongoose.connection.close();
  }
};

testSuperAdminAuth();