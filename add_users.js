require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

// Connect to database
connectDB();

const addUsers = async () => {
  try {
    // Check if users already exist
    const gasPlantUser = await User.findOne({ email: 'plant@tracklet.com' });
    const distributorUser = await User.findOne({ email: 'distributor@tracklet.com' });

    if (gasPlantUser) {
      console.log('Gas Plant user already exists');
    } else {
      // Create gas plant user
      const gasPlantPassword = await bcrypt.hash('12345678', 10);
      const newGasPlantUser = new User({
        name: 'Gas Plant User',
        email: 'plant@tracklet.com',
        password: gasPlantPassword,
        role: 'gas_plant'
      });
      
      await newGasPlantUser.save();
      console.log('Gas Plant user created successfully');
    }

    if (distributorUser) {
      console.log('Distributor user already exists');
    } else {
      // Create distributor user
      const distributorPassword = await bcrypt.hash('12345678', 10);
      const newDistributorUser = new User({
        name: 'Distributor User',
        email: 'distributor@tracklet.com',
        password: distributorPassword,
        role: 'distributor'
      });
      
      await newDistributorUser.save();
      console.log('Distributor user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding users:', error);
    process.exit(1);
  }
};

addUsers();