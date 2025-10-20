const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');

// @route   GET api/plants
// @desc    Get all plants
// @access  Public (in real app, this would be protected)
router.get('/', async (req, res) => {
  try {
    console.log('Backend: Fetching all plants');
    const plants = await Plant.find({ status: 'active' }).sort({ createdAt: -1 });
    console.log('Backend: Found', plants.length, 'active plants');
    res.json(plants);
  } catch (err) {
    console.error('Fetching plants error:', err.message);
    res.status(500).json({ msg: 'Fetching plants failed', error: err.message });
  }
});

// @route   GET api/plants/:id
// @desc    Get plant by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Fetching plant with ID:', id);

    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({ msg: 'Plant not found' });
    }

    res.json(plant);
  } catch (err) {
    console.error('Fetching plant error:', err.message);
    res.status(500).json({ msg: 'Fetching plant failed', error: err.message });
  }
});

// @route   POST api/plants
// @desc    Create a new plant
// @access  Public (in real app, this would be protected)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      location,
      city,
      contactNumber,
      email,
      perKgPrice,
      imageUrl,
      totalCapacity,
      currentStock,
      ownerId,
    } = req.body;

    console.log('Backend: Creating plant:', name);

    // Validate required fields
    if (!name || !location || !city || !contactNumber || !email || !ownerId) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Create new plant
    const plant = new Plant({
      name,
      location,
      city,
      contactNumber,
      email,
      perKgPrice: perKgPrice || 250,
      imageUrl: imageUrl || 'https://via.placeholder.com/400x200?text=Gas+Plant',
      totalCapacity: totalCapacity || 0,
      currentStock: currentStock || 0,
      ownerId,
    });

    const savedPlant = await plant.save();
    console.log('Backend: Plant created successfully with ID:', savedPlant._id);
    res.json(savedPlant);
  } catch (err) {
    console.error('Plant creation error:', err.message);
    res.status(500).json({ msg: 'Plant creation failed', error: err.message });
  }
});

// @route   PUT api/plants/:id
// @desc    Update a plant
// @access  Public (in real app, this would be protected)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Updating plant with ID:', id);

    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({ msg: 'Plant not found' });
    }

    // Update fields
    const {
      name,
      location,
      city,
      contactNumber,
      email,
      perKgPrice,
      imageUrl,
      totalCapacity,
      currentStock,
      status,
    } = req.body;

    if (name) plant.name = name;
    if (location) plant.location = location;
    if (city) plant.city = city;
    if (contactNumber) plant.contactNumber = contactNumber;
    if (email) plant.email = email;
    if (perKgPrice) plant.perKgPrice = perKgPrice;
    if (imageUrl) plant.imageUrl = imageUrl;
    if (totalCapacity !== undefined) plant.totalCapacity = totalCapacity;
    if (currentStock !== undefined) plant.currentStock = currentStock;
    if (status) plant.status = status;

    const updatedPlant = await plant.save();
    console.log('Backend: Plant updated successfully');
    res.json(updatedPlant);
  } catch (err) {
    console.error('Updating plant error:', err.message);
    res.status(500).json({ msg: 'Updating plant failed', error: err.message });
  }
});

// @route   DELETE api/plants/:id
// @desc    Delete a plant (soft delete by setting status to inactive)
// @access  Public (in real app, this would be protected)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Deleting plant with ID:', id);

    const plant = await Plant.findById(id);
    if (!plant) {
      return res.status(404).json({ msg: 'Plant not found' });
    }

    // Soft delete
    plant.status = 'inactive';
    await plant.save();

    console.log('Backend: Plant deleted (soft) successfully');
    res.json({ msg: 'Plant deleted successfully', plant });
  } catch (err) {
    console.error('Deleting plant error:', err.message);
    res.status(500).json({ msg: 'Deleting plant failed', error: err.message });
  }
});

module.exports = router;

