const express = require('express');
const router = express.Router();
const GasPlant = require('../models/GasPlant'); // Import GasPlant model

// In a real implementation, you would store this in a database
let currentRate = 260; // Default rate
let rateHistory = [
  { date: new Date('2023-10-01'), rate: 250, totalSales: 1250 },
  { date: new Date('2023-10-15'), rate: 260, totalSales: 1420 },
  // Add more mock data as needed
];

// @route   POST api/rates
// @desc    Set today's rate and update all gas plants' perKgPrice
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { rate } = req.body;

    if (rate === undefined || rate <= 0) {
      return res.status(400).json({ msg: 'Invalid rate value' });
    }

    // Save current rate
    currentRate = rate;

    // Add to history
    rateHistory.push({
      date: new Date(),
      rate: rate,
      totalSales: Math.floor(Math.random() * 1000) + 500, // Mock sales data
    });

    console.log('Backend: Rate set to', rate);
    
    // Update all gas plants' perKgPrice to match the new rate
    try {
      const result = await GasPlant.updateMany(
        { status: 'active' },
        { perKgPrice: rate }
      );
      console.log(`Backend: Updated ${result.modifiedCount} gas plants with new rate`);
    } catch (updateError) {
      console.error('Backend: Error updating gas plants with new rate:', updateError.message);
    }

    res.json({ msg: 'Rate updated successfully', rate });
  } catch (err) {
    console.error('Setting rate error:', err.message);
    res.status(500).json({ msg: 'Setting rate failed', error: err.message });
  }
});

// @route   GET api/rates/current
// @desc    Get today's rate
// @access  Public
router.get('/current', (req, res) => {
  try {
    console.log('Backend: Fetching current rate');
    res.json({ rate: currentRate });
  } catch (err) {
    console.error('Fetching current rate error:', err.message);
    res.status(500).json({ msg: 'Fetching current rate failed', error: err.message });
  }
});

// @route   GET api/rates/history
// @desc    Get rate history
// @access  Public
router.get('/history', (req, res) => {
  try {
    const { search, month, year } = req.query;
    
    console.log('Backend: Fetching rate history');
    
    let filteredHistory = [...rateHistory].reverse(); // Most recent first
    
    // Apply filters if provided
    if (search) {
      filteredHistory = filteredHistory.filter(entry => 
        new Date(entry.date).toString().includes(search) || 
        entry.rate.toString().includes(search) ||
        entry.totalSales.toString().includes(search)
      );
    }
    
    if (month) {
      filteredHistory = filteredHistory.filter(entry => 
        new Date(entry.date).getMonth() + 1 == month
      );
    }
    
    if (year) {
      filteredHistory = filteredHistory.filter(entry => 
        new Date(entry.date).getFullYear() == year
      );
    }
    
    // Format data for frontend
    const formattedHistory = filteredHistory.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0], // YYYY-MM-DD format
      totalSalesKg: entry.totalSales,
      ratePerKg: entry.rate
    }));
    
    res.json({ 
      history: formattedHistory,
      count: formattedHistory.length
    });
  } catch (err) {
    console.error('Fetching rate history error:', err.message);
    res.status(500).json({ msg: 'Fetching rate history failed', error: err.message });
  }
});

module.exports = router;