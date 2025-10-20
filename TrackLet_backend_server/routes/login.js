const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Use same secret as defined in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'tracklet_jwt_secret';

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

function userAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user || decoded; // support { user: {...} } or flat payload
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// POST /api/login — issue JWT for gas_plant or distributor users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: payload });
  } catch (error) {
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// POST /api/users/change-password — change user password
router.post('/users/change-password', userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, msg: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: 'New password must be at least 6 characters' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Current password is incorrect' });
    }

    // Check if new password is same as current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({ success: false, msg: 'New password must be different from current password' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.json({ success: true, msg: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// GET /api/users/email/:email — fetch user by email (requires user token)
router.get('/users/email/:email', userAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    return res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      status: user.status,
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/users/profile — current user from token
router.get('/users/profile', userAuth, async (req, res) => {
  try {
    const tokenUser = req.user; // { id, email, role }
    const user = await User.findById(tokenUser.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      companyId: user.companyId,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
      status: user.status,
      isDeleted: user.isDeleted,
    });
  } catch (error) {
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
module.exports.userAuth = userAuth;
