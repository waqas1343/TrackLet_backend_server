const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SuperAdmin = require('../models/SuperAdmin');

const router = express.Router();

// @route   POST /api/super-admin/register
// @desc    Register super admin (only once for setup)
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if super admin already exists
      const existingAdmin = await SuperAdmin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ msg: 'Super Admin already exists' });
      }

      // Create super admin
      const superAdmin = new SuperAdmin({
        name,
        email,
        password,
      });

      // Save super admin
      await superAdmin.save();

      // Return success message
      res.status(201).json({ msg: 'Super Admin registered successfully' });
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

// @route   POST /api/super-admin/login
// @desc    Authenticate super admin & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if super admin exists
      let superAdmin = await SuperAdmin.findOne({ email });
      if (!superAdmin) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Check password
      const isMatch = await superAdmin.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Update last login without triggering password hash
      superAdmin.lastLogin = Date.now();
      await superAdmin.save({ validateBeforeSave: false });

      // Return jwt
      const payload = {
        superAdmin: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;