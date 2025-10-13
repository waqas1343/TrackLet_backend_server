const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log('Backend: Registration attempt for email:', email, 'with role:', role);
    
    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    let user = await User.findOne({ email });
    console.log('Backend: User lookup result for email', email, ':', user ? 'User already exists' : 'New user');

    if (user) {
      console.log('Backend: Registration failed - User already exists for email:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: role || 'user', // Use provided role or default to 'user'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    console.log('Backend: User saved successfully for email:', email, 'with role:', user.role);

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }
        
        // Return token and user data
        const responseData = { 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        };
        
        console.log('Backend: Sending registration response for email:', email, 'with data:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error('Registration error stack:', err.stack);
    res.status(500).json({ msg: 'Registration failed', error: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Backend: Login attempt for email:', email);
    
    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    let user = await User.findOne({ email });
    console.log('Backend: User lookup result for email', email, ':', user ? 'User found' : 'User not found');

    if (!user) {
      console.log('Backend: Login failed - Invalid credentials for email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Backend: Password comparison result for email', email, ':', isMatch ? 'Match' : 'No match');

    if (!isMatch) {
      console.log('Backend: Login failed - Invalid credentials for email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('Backend: Login successful for email:', email, 'with role:', user.role);

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ msg: 'Token generation failed' });
        }
        
        // Return token and user data
        const responseData = { 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        };
        
        console.log('Backend: Sending login response for email:', email, 'with data:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    console.error('Login error stack:', err.stack);
    res.status(500).json({ msg: 'Login failed', error: err.message });
  }
});

module.exports = router;