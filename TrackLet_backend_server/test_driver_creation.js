const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Test driver creation functionality
async function testDriverCreation() {
  try {
    console.log('Testing driver creation...');
    
    // Import models
    const User = require('./models/User');
    
    // Find a distributor user to act as the creator
    const distributorUser = await User.findOne({ role: 'distributor' });
    
    if (!distributorUser) {
      console.log('Distributor user not found. Please create a distributor user first.');
      process.exit(1);
    }
    
    console.log(`Distributor User: ${distributorUser.email} (${distributorUser._id})`);
    
    // Test creating a driver
    console.log('\n--- Creating test driver ---');
    
    // Generate a dummy email
    const phoneNumber = '1234567890';
    const email = `driver_${phoneNumber}@tracklet.com`;
    
    // Check if driver already exists
    const existingDriver = await User.findOne({ email });
    if (existingDriver) {
      console.log('Driver already exists with this email:', existingDriver.email);
      // Delete existing driver for testing
      await User.deleteOne({ email });
      console.log('Deleted existing driver for clean test');
    }
    
    // Create new driver
    const newDriver = new User({
      name: 'Test Driver',
      email: email,
      phoneNumber: phoneNumber,
      role: 'distributor',
      createdBy: distributorUser._id, // Use the distributor's ID as createdBy
      password: 'tracklet123'
    });
    
    const savedDriver = await newDriver.save();
    
    console.log('Driver created successfully:', {
      id: savedDriver._id,
      name: savedDriver.name,
      email: savedDriver.email,
      phoneNumber: savedDriver.phoneNumber,
      createdBy: savedDriver.createdBy
    });
    
    // Clean up - delete the test driver
    await User.deleteOne({ _id: savedDriver._id });
    console.log('Test driver cleaned up');
    
    console.log('\n--- Test completed successfully ---');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

testDriverCreation();