const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SuperAdmin = require('./models/SuperAdmin');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.log('MongoDB connection error:', err.message));

// Create super admin user
async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: 'admin@tracklet.com' });
    if (existingAdmin) {
      console.log('Super Admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new SuperAdmin({
      name: 'Admin User',
      email: 'admin@tracklet.com',
      password: 'admin123',
    });

    // Save super admin
    await superAdmin.save();
    console.log('Super Admin created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating super admin:', err.message);
    process.exit(1);
  }
}

// Run the function
createSuperAdmin();