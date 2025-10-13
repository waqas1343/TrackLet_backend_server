const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   GET api/profile/:userId
// @desc    Get user profile
// @access  Public (in real app, should be protected)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Backend: Fetching profile for userId:', userId);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Backend: Profile found for:', user.email);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio || '',
      profileImageUrl: user.profileImageUrl || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error('Fetching profile error:', err.message);
    res.status(500).json({ msg: 'Fetching profile failed', error: err.message });
  }
});

// @route   PUT api/profile/:userId
// @desc    Update user profile
// @access  Public (in real app, should be protected)
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, bio, profileImageUrl, phoneNumber, address } = req.body;

    console.log('Backend: Updating profile for userId:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;

    const updatedUser = await user.save();
    console.log('Backend: Profile updated successfully for:', updatedUser.email);

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio || '',
      profileImageUrl: updatedUser.profileImageUrl || '',
      phoneNumber: updatedUser.phoneNumber || '',
      address: updatedUser.address || '',
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (err) {
    console.error('Updating profile error:', err.message);
    res.status(500).json({ msg: 'Updating profile failed', error: err.message });
  }
});

// @route   PUT api/profile/:userId/change-password
// @desc    Change user password
// @access  Public (in real app, should be protected)
router.put('/:userId/change-password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('Backend: Changing password for userId:', userId);

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current password and new password are required' });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Backend: Current password incorrect for userId:', userId);
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log('Backend: Password changed successfully for:', user.email);

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('Changing password error:', err.message);
    res.status(500).json({ msg: 'Changing password failed', error: err.message });
  }
});

module.exports = router;

