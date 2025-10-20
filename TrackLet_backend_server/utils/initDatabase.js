/**
 * Database initialization script
 * Creates default super admin user and any other required initial data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('../models/SuperAdmin');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Create default super admin
async function createDefaultSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: 'admin@tracklet.com' });
    if (existingAdmin) {
      console.log('Super Admin already exists');
      mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create super admin
    const superAdmin = new SuperAdmin({
      name: 'Tracklet Admin',
      email: 'admin@tracklet.com',
      password: hashedPassword,
    });

    // Save super admin
    await superAdmin.save();
    console.log('Default Super Admin created successfully');
    console.log('Email: admin@tracklet.com');
    console.log('Password: admin123');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating default super admin:', err.message);
    mongoose.connection.close();
  }
}

// Run the initialization
createDefaultSuperAdmin();