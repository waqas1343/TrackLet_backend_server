const express = require('express');
const jwt = require('jsonwebtoken');
const { validationResult, query } = require('express-validator');
const Company = require('../models/Company');
const SuperAdmin = require('../models/SuperAdmin');

const router = express.Router();

// Middleware to authenticate super admin
const authMiddleware = async (req, res, next) => {
  const token = req.header('x-auth-token');
  
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

// @route   GET /api/companies
// @desc    Retrieve all companies
// @access  Private (Super Admin only)
router.get(
  '/',
  authMiddleware,
  [
    query('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const { search } = req.query;
      
      // Build filter object
      let filter = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { ownerEmail: { $regex: search, $options: 'i' } },
        ];
      }
      
      // Exclude deleted companies
      filter.isDeleted = false;
      
      // Get companies with pagination
      const companies = await Company.find(filter)
        .populate('ownerUserId', 'email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      
      res.json(companies);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;