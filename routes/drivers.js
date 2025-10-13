const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// @route   GET api/drivers
// @desc    Search for available drivers
// @access  Public (in real app, should be protected)
router.get('/', async (req, res) => {
  try {
    const { search, employerId } = req.query;
    console.log('Backend: Searching drivers with query:', search);

    let query = { role: 'Driver', status: 'Active' };
    
    if (employerId) {
      query.employerId = employerId;
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Employee.find(query).limit(20);
    console.log('Backend: Found', drivers.length, 'drivers');

    res.json(drivers);
  } catch (err) {
    console.error('Searching drivers error:', err.message);
    res.status(500).json({ msg: 'Searching drivers failed', error: err.message });
  }
});

// @route   GET api/drivers/:id
// @desc    Get driver by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Fetching driver with ID:', id);

    const driver = await Employee.findById(id);
    if (!driver || driver.role !== 'Driver') {
      return res.status(404).json({ msg: 'Driver not found' });
    }

    res.json(driver);
  } catch (err) {
    console.error('Fetching driver error:', err.message);
    res.status(500).json({ msg: 'Fetching driver failed', error: err.message });
  }
});

module.exports = router;

