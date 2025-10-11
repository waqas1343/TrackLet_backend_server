require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

// Connect to database
connectDB();

const verifyUsers = async () => {
  try {
    // Check if users exist
    const gasPlantUser = await User.findOne({ email: 'plant@tracklet.com' });
    const distributorUser = await User.findOne({ email: 'distributor@tracklet.com' });

    console.log('Gas Plant User:');
    if (gasPlantUser) {
      console.log(`  Name: ${gasPlantUser.name}`);
      console.log(`  Email: ${gasPlantUser.email}`);
      console.log(`  Role: ${gasPlantUser.role}`);
      console.log(`  Created: ${gasPlantUser.createdAt}`);
    } else {
      console.log('  Not found');
    }

    console.log('\nDistributor User:');
    if (distributorUser) {
      console.log(`  Name: ${distributorUser.name}`);
      console.log(`  Email: ${distributorUser.email}`);
      console.log(`  Role: ${distributorUser.role}`);
      console.log(`  Created: ${distributorUser.createdAt}`);
    } else {
      console.log('  Not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying users:', error);
    process.exit(1);
  }
};

verifyUsers();