const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// @route   GET api/expenses/user/:userId
// @desc    Get all expenses for a user
// @access  Public (in real app, should be protected)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Backend: Fetching expenses for userId:', userId);

    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    console.log('Backend: Found', expenses.length, 'expenses for userId:', userId);

    res.json(expenses);
  } catch (err) {
    console.error('Fetching expenses error:', err.message);
    res.status(500).json({ msg: 'Fetching expenses failed', error: err.message });
  }
});

// @route   GET api/expenses/:id
// @desc    Get single expense by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Fetching expense with ID:', id);

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error('Fetching expense error:', err.message);
    res.status(500).json({ msg: 'Fetching expense failed', error: err.message });
  }
});

// @route   POST api/expenses
// @desc    Create new expense
// @access  Public (in real app, should be protected)
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, description, paymentMethod, userId, plantId } = req.body;

    console.log('Backend: Creating expense:', title);

    // Validate required fields
    if (!title || !amount || !category || !date || !userId) {
      return res.status(400).json({ msg: 'Missing required fields: title, amount, category, date, userId' });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ msg: 'Amount must be greater than 0' });
    }

    // Create new expense
    const expense = new Expense({
      title,
      amount,
      category,
      date,
      description: description || '',
      paymentMethod: paymentMethod || 'Cash',
      userId,
      plantId: plantId || '',
    });

    const savedExpense = await expense.save();
    console.log('Backend: Expense created successfully with ID:', savedExpense._id);

    res.json(savedExpense);
  } catch (err) {
    console.error('Expense creation error:', err.message);
    res.status(500).json({ msg: 'Expense creation failed', error: err.message });
  }
});

// @route   PUT api/expenses/:id
// @desc    Update expense
// @access  Public (in real app, should be protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Updating expense with ID:', id);

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Update fields
    const { title, amount, category, date, description, paymentMethod } = req.body;

    if (title) expense.title = title;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ msg: 'Amount must be greater than 0' });
      }
      expense.amount = amount;
    }
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (paymentMethod) expense.paymentMethod = paymentMethod;

    const updatedExpense = await expense.save();
    console.log('Backend: Expense updated successfully');

    res.json(updatedExpense);
  } catch (err) {
    console.error('Updating expense error:', err.message);
    res.status(500).json({ msg: 'Updating expense failed', error: err.message });
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete expense
// @access  Public (in real app, should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Deleting expense with ID:', id);

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    console.log('Backend: Expense deleted successfully');
    res.json({ msg: 'Expense deleted successfully', expense });
  } catch (err) {
    console.error('Deleting expense error:', err.message);
    res.status(500).json({ msg: 'Deleting expense failed', error: err.message });
  }
});

// @route   GET api/expenses/user/:userId/stats
// @desc    Get expense statistics for a user
// @access  Public
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Backend: Fetching expense stats for userId:', userId);

    const expenses = await Expense.find({ userId });

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate by category
    const byCategory = {};
    expenses.forEach((expense) => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0;
      }
      byCategory[expense.category] += expense.amount;
    });

    // Calculate this month's expenses
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = expenses.filter(
      (expense) => new Date(expense.date) >= firstDayOfMonth
    );
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    console.log('Backend: Stats calculated - Total:', total, 'This Month:', thisMonthTotal);

    res.json({
      total,
      count: expenses.length,
      byCategory,
      thisMonthTotal,
      thisMonthCount: thisMonthExpenses.length,
    });
  } catch (err) {
    console.error('Fetching expense stats error:', err.message);
    res.status(500).json({ msg: 'Fetching expense stats failed', error: err.message });
  }
});

module.exports = router;

