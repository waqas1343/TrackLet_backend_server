const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const SuperAdmin = require('../models/SuperAdmin');

// Import the userAuth middleware from login routes
const { userAuth } = require('./login');

const router = express.Router();

// Extract token from either Authorization: Bearer or x-auth-token
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.headers['x-auth-token']) {
    return req.headers['x-auth-token'];
  }
  return null;
}

// Middleware to authenticate super admin
const authMiddleware = async (req, res, next) => {
  const token = extractToken(req);
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.superAdmin = decoded.superAdmin;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST /api/users
// @desc    Create a new user (Gas Plant / Distributor)
// @access  Private (Super Admin only)
router.post(
  '/',
  authMiddleware,
  [
    body('email', 'Please include a valid email').isEmail(),
    body('role', 'Role is required').isIn(['gas_plant', 'distributor']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, name } = req.body;
    const superAdminId = req.superAdmin.id;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists with this email' });
      }

      // Create user object (password will be hashed by pre-save hook)
      user = new User({
        email,
        role,
        password: '123123', // Plain text password, will be hashed by pre-save hook
        createdBy: superAdminId,
        // Only add name if it's provided
        ...(name && { name }),
      });

      // Save user first to generate the _id
      await user.save();

      let company = null;

      // If role is gas_plant, auto-create a company
      if (role === 'gas_plant') {
        // Generate company name from email prefix
        const companyName = email.split('@')[0].replace(/\d+/g, match => ` ${match}`).replace(/\b\w/g, l => l.toUpperCase()).trim();
        
        // Create company
        company = new Company({
          name: companyName,
          ownerEmail: email,
          ownerUserId: user._id,  // Now user._id is available
          createdBy: superAdminId,
        });

        // Save company
        await company.save();

        // Link company to user
        user.companyId = company._id;
        
        // Save user again with the companyId
        await user.save();
      }

      // Return created user with linked company details
      const userData = {
        id: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        createdBy: user.createdBy,
        createdAt: user.createdAt,
        status: user.status,
      };

      if (company) {
        userData.company = {
          id: company._id,
          name: company.name,
          ownerEmail: company.ownerEmail,
          createdAt: company.createdAt,
        };
      }

      res.status(201).json({
        msg: 'User created successfully with default password: 123123',
        user: userData,
      });
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/users
// @desc    Retrieve all users (optional filter by role or search query)
// @access  Private (Super Admin only)
router.get(
  '/',
  authMiddleware,
  [
    query('role').optional().isIn(['gas_plant', 'distributor']),
    query('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const { role, search } = req.query;
      
      // Build filter object
      let filter = {};
      
      if (role) {
        filter.role = role;
      }
      
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ];
      }
      
      // Exclude deleted users
      filter.isDeleted = false;
      
      // Get users with pagination
      const users = await User.find(filter)
        .populate('companyId', 'name ownerEmail createdAt')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Super Admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('companyId', 'name ownerEmail createdAt')
      .select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Super Admin only)
router.put(
  '/:id',
  authMiddleware,
  [
    body('email', 'Please include a valid email').optional().isEmail(),
    body('role', 'Role must be gas_plant or distributor').optional().isIn(['gas_plant', 'distributor']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, name, status } = req.body;

    try {
      let user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update fields if provided
      if (email) user.email = email;
      if (role) user.role = role;
      if (name !== undefined) user.name = name;
      if (status) user.status = status;

      // Save updated user
      user = await user.save();

      res.json(user);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Super Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Soft delete - set isDeleted flag to true
    user.isDeleted = true;
    user.status = 'deleted';
    await user.save();

    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/users/:id/reset
// @desc    Reset user password to default (123123)
// @access  Private (Super Admin only)
router.post('/:id/reset', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user password (will be hashed by pre-save hook)
    user.password = '123123';
    await user.save();

    res.json({ msg: 'Password reset successfully to default: 123123' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/email/:email
// @desc    Get user by email (for tracklet.com users)
// @access  Public (used by tracklet_pro app)
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .populate('companyId', 'name ownerEmail createdAt')
      .select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET /api/users/:id/profile
// @desc    Get user profile
// @access  Private (User only)
router.get('/profile', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('companyId', 'name ownerEmail createdAt')
      .select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private (User only)
router.put('/profile', userAuth, async (req, res) => {
  const { name, email, phoneNumber, address, bio } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;

    // Save updated user
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST /api/users/:id/track
// @desc    Track user activity (for super admin)
// @access  Private (Super Admin only)
router.post('/:id/track', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    res.json({ msg: 'User activity tracked successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;