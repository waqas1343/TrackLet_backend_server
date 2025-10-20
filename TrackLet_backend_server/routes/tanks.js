const express = require('express');
const router = express.Router();
const Tank = require('../models/Tank');
const StockTransaction = require('../models/StockTransaction');

// @route   GET api/tanks/owner/:ownerId
// @desc    Get all tanks for an owner
// @access  Public (in real app, should be protected)
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log('Backend: Fetching tanks for ownerId:', ownerId);

    const tanks = await Tank.find({ ownerId }).sort({ createdAt: -1 });
    console.log('Backend: Found', tanks.length, 'tanks for ownerId:', ownerId);

    res.json(tanks);
  } catch (err) {
    console.error('Fetching tanks error:', err.message);
    res.status(500).json({ msg: 'Fetching tanks failed', error: err.message });
  }
});

// @route   GET api/tanks/:id
// @desc    Get single tank by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Fetching tank with ID:', id);

    const tank = await Tank.findById(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    res.json(tank);
  } catch (err) {
    console.error('Fetching tank error:', err.message);
    res.status(500).json({ msg: 'Fetching tank failed', error: err.message });
  }
});

// @route   POST api/tanks
// @desc    Create new tank
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, location, totalCapacity, available, ownerId } = req.body;

    console.log('Backend: Creating tank:', name);

    // Validate required fields
    if (!name || !totalCapacity || !ownerId) {
      return res.status(400).json({ msg: 'Missing required fields: name, totalCapacity, ownerId' });
    }

    // Create new tank
    const tank = new Tank({
      name,
      location: location || '',
      totalCapacity,
      available: available || 0,
      freezeGas: 0,
      status: 'Active',
      ownerId,
      lastRecordedDate: new Date(),
    });

    const savedTank = await tank.save();
    console.log('Backend: Tank created successfully with ID:', savedTank._id);

    res.json(savedTank);
  } catch (err) {
    console.error('Tank creation error:', err.message);
    res.status(500).json({ msg: 'Tank creation failed', error: err.message });
  }
});

// @route   PUT api/tanks/:id
// @desc    Update tank
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Updating tank with ID:', id);

    const tank = await Tank.findById(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    // Update fields
    const { name, location, totalCapacity, status } = req.body;

    if (name) tank.name = name;
    if (location !== undefined) tank.location = location;
    if (totalCapacity !== undefined) tank.totalCapacity = totalCapacity;
    if (status) tank.status = status;

    const updatedTank = await tank.save();
    console.log('Backend: Tank updated successfully');

    res.json(updatedTank);
  } catch (err) {
    console.error('Updating tank error:', err.message);
    res.status(500).json({ msg: 'Updating tank failed', error: err.message });
  }
});

// @route   DELETE api/tanks/:id
// @desc    Delete tank
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Deleting tank with ID:', id);

    const tank = await Tank.findByIdAndDelete(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    console.log('Backend: Tank deleted successfully');
    res.json({ msg: 'Tank deleted successfully', tank });
  } catch (err) {
    console.error('Deleting tank error:', err.message);
    res.status(500).json({ msg: 'Deleting tank failed', error: err.message });
  }
});

// @route   POST api/tanks/:id/add-gas
// @desc    Add gas to tank
// @access  Public
router.post('/:id/add-gas', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, rate } = req.body;

    console.log('Backend: Adding gas to tank:', id, 'Amount:', amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const tank = await Tank.findById(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    // Check capacity
    if (tank.available + amount > tank.totalCapacity) {
      return res.status(400).json({ msg: 'Exceeds tank capacity' });
    }

    // Update tank
    tank.available += amount;
    tank.lastRecordedDate = new Date();
    await tank.save();

    // Create transaction record
    const transaction = new StockTransaction({
      tankId: tank._id,
      tankName: tank.name,
      type: 'add',
      amount,
      rate: rate || 0,
      ownerId: tank.ownerId,
      notes: 'Gas added to tank',
      date: new Date(),
    });
    await transaction.save();

    console.log('Backend: Gas added successfully');
    res.json(tank);
  } catch (err) {
    console.error('Adding gas error:', err.message);
    res.status(500).json({ msg: 'Adding gas failed', error: err.message });
  }
});

// @route   POST api/tanks/:id/freeze-gas
// @desc    Freeze gas in tank
// @access  Public
router.post('/:id/freeze-gas', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log('Backend: Freezing gas in tank:', id, 'Amount:', amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const tank = await Tank.findById(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    // Check available gas
    if (amount > tank.available) {
      return res.status(400).json({ msg: 'Not enough available gas to freeze' });
    }

    // Move from available to frozen
    tank.available -= amount;
    tank.freezeGas += amount;
    tank.lastRecordedDate = new Date();
    await tank.save();

    // Create transaction record
    const transaction = new StockTransaction({
      tankId: tank._id,
      tankName: tank.name,
      type: 'freeze',
      amount,
      ownerId: tank.ownerId,
      notes: 'Gas frozen in tank',
      date: new Date(),
    });
    await transaction.save();

    console.log('Backend: Gas frozen successfully');
    res.json(tank);
  } catch (err) {
    console.error('Freezing gas error:', err.message);
    res.status(500).json({ msg: 'Freezing gas failed', error: err.message });
  }
});

// @route   POST api/tanks/:id/unfreeze-gas
// @desc    Unfreeze gas in tank (melt)
// @access  Public
router.post('/:id/unfreeze-gas', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log('Backend: Unfreezing gas in tank:', id, 'Amount:', amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const tank = await Tank.findById(id);
    if (!tank) {
      return res.status(404).json({ msg: 'Tank not found' });
    }

    // Check frozen gas
    if (amount > tank.freezeGas) {
      return res.status(400).json({ msg: 'Not enough frozen gas to unfreeze' });
    }

    // Move from frozen to available
    tank.freezeGas -= amount;
    tank.available += amount;
    tank.lastRecordedDate = new Date();
    await tank.save();

    // Create transaction record
    const transaction = new StockTransaction({
      tankId: tank._id,
      tankName: tank.name,
      type: 'unfreeze',
      amount,
      ownerId: tank.ownerId,
      notes: 'Gas unfrozen in tank',
      date: new Date(),
    });
    await transaction.save();

    console.log('Backend: Gas unfrozen successfully');
    res.json(tank);
  } catch (err) {
    console.error('Unfreezing gas error:', err.message);
    res.status(500).json({ msg: 'Unfreezing gas failed', error: err.message });
  }
});

// @route   POST api/tanks/deduct-stock
// @desc    Deduct stock from tanks (when order is placed)
// @access  Public
router.post('/deduct-stock', async (req, res) => {
  try {
    const { ownerId, amount, rate, orderId } = req.body;

    console.log('Backend: Deducting stock for ownerId:', ownerId, 'Amount:', amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    // Get all active tanks
    const tanks = await Tank.find({ ownerId, status: 'Active' }).sort({ available: -1 });

    let remainingToDeduct = amount; // in tons
    const deductedTanks = [];

    // Deduct from tanks with highest available gas first
    for (const tank of tanks) {
      if (remainingToDeduct <= 0) break;

      const deductFromThisTank = Math.min(tank.available, remainingToDeduct);
      
      if (deductFromThisTank > 0) {
        tank.available -= deductFromThisTank;
        tank.lastRecordedDate = new Date();
        await tank.save();

        deductedTanks.push({ tankId: tank._id, tankName: tank.name, amount: deductFromThisTank });

        // Create transaction record
        const transaction = new StockTransaction({
          tankId: tank._id,
          tankName: tank.name,
          type: 'deduct',
          amount: deductFromThisTank,
          rate: rate || 0,
          orderId: orderId || '',
          ownerId,
          notes: orderId ? `Stock deducted for order ${orderId}` : 'Stock deducted',
          date: new Date(),
        });
        await transaction.save();

        remainingToDeduct -= deductFromThisTank;
      }
    }

    if (remainingToDeduct > 0) {
      console.log('Backend: Warning - Not enough stock. Remaining:', remainingToDeduct);
      return res.status(400).json({ 
        msg: 'Not enough stock available',
        shortfall: remainingToDeduct 
      });
    }

    console.log('Backend: Stock deducted successfully from', deductedTanks.length, 'tanks');
    res.json({ msg: 'Stock deducted successfully', deductedTanks });
  } catch (err) {
    console.error('Deducting stock error:', err.message);
    res.status(500).json({ msg: 'Deducting stock failed', error: err.message });
  }
});

// @route   POST api/tanks/deduct-stock-sequential
// @desc    Deduct stock from tanks sequentially (A → B → C) when order is accepted
// @access  Public
router.post('/deduct-stock-sequential', async (req, res) => {
  try {
    const { ownerId, amount, rate, orderId } = req.body;

    console.log('Backend: Deducting stock sequentially for ownerId:', ownerId, 'Amount:', amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    // Get all active tanks in sequential order (by name to ensure A → B → C)
    const tanks = await Tank.find({ ownerId, status: 'Active' }).sort({ name: 1 });

    let remainingToDeduct = amount; // in tons
    const deductedTanks = [];

    // Deduct from tanks sequentially (A → B → C) as per specification
    for (const tank of tanks) {
      if (remainingToDeduct <= 0) break;

      const deductFromThisTank = Math.min(tank.available, remainingToDeduct);
      
      if (deductFromThisTank > 0) {
        tank.available -= deductFromThisTank;
        tank.lastRecordedDate = new Date();
        await tank.save();

        deductedTanks.push({ tankId: tank._id, tankName: tank.name, amount: deductFromThisTank });

        // Create transaction record
        const transaction = new StockTransaction({
          tankId: tank._id,
          tankName: tank.name,
          type: 'deduct',
          amount: deductFromThisTank,
          rate: rate || 0,
          orderId: orderId || '',
          ownerId,
          notes: orderId ? `Stock deducted for order ${orderId} (sequential)` : 'Stock deducted (sequential)',
          date: new Date(),
        });
        await transaction.save();

        remainingToDeduct -= deductFromThisTank;
      }
    }

    if (remainingToDeduct > 0) {
      console.log('Backend: Warning - Not enough stock. Remaining:', remainingToDeduct);
      return res.status(400).json({ 
        msg: 'Not enough stock available',
        shortfall: remainingToDeduct 
      });
    }

    console.log('Backend: Stock deducted successfully from', deductedTanks.length, 'tanks');
    res.json({ msg: 'Stock deducted successfully', deductedTanks });
  } catch (err) {
    console.error('Deducting stock sequentially error:', err.message);
    res.status(500).json({ msg: 'Deducting stock failed', error: err.message });
  }
});

// @route   GET api/tanks/owner/:ownerId/transactions
// @desc    Get all stock transactions for owner
// @access  Public
router.get('/owner/:ownerId/transactions', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { startDate, endDate, type } = req.query;

    console.log('Backend: Fetching transactions for ownerId:', ownerId);

    const query = { ownerId };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(query).sort({ date: -1 });
    console.log('Backend: Found', transactions.length, 'transactions');

    res.json(transactions);
  } catch (err) {
    console.error('Fetching transactions error:', err.message);
    res.status(500).json({ msg: 'Fetching transactions failed', error: err.message });
  }
});

// @route   GET api/tanks/owner/:ownerId/stats
// @desc    Get stock statistics
// @access  Public
router.get('/owner/:ownerId/stats', async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log('Backend: Fetching stock stats for ownerId:', ownerId);

    const tanks = await Tank.find({ ownerId });

    // Calculate totals
    const totalCapacity = tanks.reduce((sum, tank) => sum + tank.totalCapacity, 0);
    const totalAvailable = tanks.reduce((sum, tank) => sum + tank.available, 0);
    const totalFrozen = tanks.reduce((sum, tank) => sum + tank.freezeGas, 0);
    const activeTanks = tanks.filter(tank => tank.status === 'Active').length;

    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await StockTransaction.find({
      ownerId,
      date: { $gte: today }
    });

    const todayAdded = todayTransactions
      .filter(t => t.type === 'add')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayDeducted = todayTransactions
      .filter(t => t.type === 'deduct')
      .reduce((sum, t) => sum + t.amount, 0);

    const todaySales = todayTransactions
      .filter(t => t.type === 'deduct')
      .reduce((sum, t) => sum + (t.amount * 1000 * t.rate), 0); // Convert tons to kg

    console.log('Backend: Stats calculated');

    res.json({
      totalCapacity,
      totalAvailable,
      totalFrozen,
      totalTanks: tanks.length,
      activeTanks,
      todayAdded,
      todayDeducted,
      todaySales,
    });
  } catch (err) {
    console.error('Fetching stats error:', err.message);
    res.status(500).json({ msg: 'Fetching stats failed', error: err.message });
  }
});

module.exports = router;

