const express = require('express');
const router = express.Router();
const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const Plant = require('../models/Plant');
const GasPlant = require('../models/GasPlant'); // New model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'tracklet_super_admin_secret_key_2025';

// Middleware to verify Super Admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper function to generate email from name
function generateEmail(name) {
  return name.toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '') + '@tracklet.com';
}

// Helper function to generate company email from plant email
function generateCompanyEmail(plantEmail) {
  // Convert plant email to company email (e.g., waqas@tracklet.com -> company.waqas@tracklet.com)
  return plantEmail.replace('@tracklet.com', '.company@tracklet.com');
}

// Helper function to generate unique Plant ID
function generatePlantId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PLANT-${randomNum}`;
}

// Helper function to generate random password
function generatePassword() {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// @route   POST /api/admin/login
// @desc    Super Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if Super Admin exists
    let superAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    
    // If Super Admin doesn't exist and this is the default admin, create it
    if (!superAdmin && email === 'agha@tracklet.com') {
      console.log('Creating default Super Admin...');
      superAdmin = new SuperAdmin({
        name: 'Agha',
        email: 'agha@tracklet.com',
        password: password, // Will be hashed by pre-save hook
      });
      await superAdmin.save();
      console.log('Default Super Admin created successfully');
    }
    
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: superAdmin._id,
        email: superAdmin.email,
        role: 'super_admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Super Admin logged in successfully');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: superAdmin.toJSON(),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/create-plant
// @desc    Create new plant user and gasPlant record
// @access  Private (Super Admin only)
router.post('/create-plant', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log('Creating plant user:', name, email);
    
    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required: name, email, password, phone' 
      });
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }
    
    // Validate phone format (simple validation)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid phone number format' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    // Check if gasPlant already exists with this ownerEmail
    const existingGasPlant = await GasPlant.findOne({ ownerEmail: email });
    if (existingGasPlant) {
      return res.status(400).json({ 
        success: false,
        message: 'GasPlant with this owner email already exists' 
      });
    }
    
    // Generate company email
    const companyEmail = generateCompanyEmail(email);
    
    // Check if companyEmail already exists
    const existingCompany = await GasPlant.findOne({ companyEmail });
    if (existingCompany) {
      return res.status(400).json({ 
        success: false,
        message: 'Company with this email already exists. Please try a different email.' 
      });
    }
    
    // Create User with role "gas_plant" (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password: password, // Plain text password, will be hashed by pre-save hook
      role: 'gas_plant',
      phoneNumber: phone,
      createdBy: req.adminId,
      profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=002455&color=fff`,
    });
    
    await user.save();
    
    // Create GasPlant record
    const gasPlant = new GasPlant({
      ownerEmail: email,
      companyEmail,
      name: '', // Will be updated by plant later
      phone: '',
      address: '',
    });
    
    await gasPlant.save();
    
    console.log('Plant user and gasPlant created successfully:', email);
    
    // Return user details with plain text password (for admin to share)
    res.status(201).json({
      success: true,
      message: 'Plant user and company created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: password, // Plain text password (only sent once)
        role: user.role,
        companyEmail,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating plant user', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Super Admin only)
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = {};
    
    // Filter by role if provided
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Get plant names for gas_plant users
    const usersWithPlantNames = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        if (user.role === 'gas_plant') {
          const gasPlant = await GasPlant.findOne({ ownerEmail: user.email });
          userObj.companyEmail = gasPlant ? gasPlant.companyEmail : 'N/A';
        }
        
        return userObj;
      })
    );
    
    res.json({
      success: true,
      count: usersWithPlantNames.length,
      users: usersWithPlantNames,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching users', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Super Admin only)
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const distributors = await User.countDocuments({ role: 'distributor' });
    const gasPlants = await User.countDocuments({ role: 'gas_plant' });
    const totalPlants = await Plant.countDocuments();
    const totalGasPlants = await GasPlant.countDocuments();
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        distributors,
        gasPlants,
        totalPlants,
        totalGasPlants,
        recentUsers,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching stats', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Super Admin only)
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Delete associated GasPlant if gas_plant
    if (user.role === 'gas_plant') {
      await GasPlant.findOneAndDelete({ ownerEmail: user.email });
      console.log('GasPlant deleted for owner:', user.email);
    }
    
    // Delete associated Plant if gas_plant (old system)
    if (user.role === 'gas_plant' && user.plantId) {
      await Plant.findOneAndDelete({ plantId: user.plantId });
      console.log('Plant deleted:', user.plantId);
    }
    
    await User.findByIdAndDelete(id);
    
    console.log('User deleted:', user.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting user', 
      error: error.message 
    });
  }
});

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Reset user password
// @access  Private (Super Admin only)
router.put('/users/:id/reset-password', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    
    await user.save();
    
    console.log('Password reset for user:', user.email);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: newPassword // Return plain text for admin to share
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while resetting password', 
      error: error.message 
    });
  }
});

module.exports = router;