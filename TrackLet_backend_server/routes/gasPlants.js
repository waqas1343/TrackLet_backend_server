const express = require('express');
const router = express.Router();
const GasPlant = require('../models/GasPlant');
const User = require('../models/User');
// Legacy plants collection (for Top Plants aggregation)
const Plant = require('../models/ManagePlant');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload'); // Import upload middleware

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'tracklet_super_admin_secret_key_2025';

// Helper to extract JWT from headers (Bearer or x-auth-token)
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0]) && parts[1]) {
      return parts[1].trim();
    }
  }
  if (req.headers['x-auth-token']) {
    return String(req.headers['x-auth-token']).trim();
  }
  return null;
}

// Optimized Middleware: Verify Plant token by checking user role from DB
const verifyPlantToken = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }
    
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.user?.id || decoded?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      });
    }
    
    // Fetch user from database to verify role
    const user = await User.findById(userId).select('_id email role');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (user.role !== 'gas_plant') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Plant users only.' 
      });
    }
    
    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

// Test route to check if gasPlants routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'GasPlants routes are working correctly!',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/gasPlants/list
// @desc    Get list of top plants (combines gasPlants + plants collections)
// @access  Public (for distributors to see available plants)
router.get('/list', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    console.log('📋 Fetching top plants list (from both collections)...');
    
    // OPTION 1: Fetch from gasPlants collection (new system)
    // Modified filter to be less strict - only require status to be active
    const gasPlants = await GasPlant.find({
      status: 'active'
    })
    .select('_id name phone companyEmail ownerEmail imageUrl perKgPrice city address')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));
    
    console.log(`✅ Found ${gasPlants.length} plants from gasPlants collection`);
    
    // OPTION 2: Also fetch from old plants collection
    const oldPlants = await Plant.find({ status: 'active' })
      .select('_id name location city contactNumber email ownerId perKgPrice imageUrl')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${oldPlants.length} plants from plants collection`);
    
    // Combine both collections and map to unified format
    const allPlants = [];
    
    // Add gasPlants (new system)
    gasPlants.forEach(plant => {
      allPlants.push({
        _id: plant._id,
        name: plant.name,
        phone: plant.phone,
        address: plant.address,
        city: plant.city || '',
        companyEmail: plant.companyEmail,
        ownerEmail: plant.ownerEmail,
        email: plant.ownerEmail, // For compatibility
        imageUrl: plant.imageUrl,
        perKgPrice: plant.perKgPrice,
        source: 'gasPlants'
      });
    });
    
    // Add old plants
    oldPlants.forEach(plant => {
      allPlants.push({
        _id: plant._id,
        name: plant.name,
        phone: plant.contactNumber,
        address: plant.location,
        city: plant.city,
        companyEmail: plant.email, // Use email as companyEmail
        ownerEmail: plant.email,
        email: plant.email,
        imageUrl: plant.imageUrl,
        perKgPrice: plant.perKgPrice,
        source: 'plants'
      });
    });
    
    console.log(`✅ Total combined plants: ${allPlants.length}`);
    
    if (allPlants.length === 0) {
      console.log('⚠️  No plants found in either collection');
    } else {
      allPlants.forEach((plant, index) => {
        console.log(`   ${index + 1}. ${plant.name} (${plant.phone}) [${plant.source}]`);
      });
    }
    
    res.json({
      success: true,
      count: allPlants.length,
      plants: allPlants,
    });
  } catch (error) {
    console.error('❌ Get plants list error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching plants list', 
      error: error.message 
    });
  }
});

// @route   GET /api/gasPlants/search
// @desc    Search gasPlants by name or companyEmail
// @access  Public (for demonstration, in real app would be protected)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }
    
    // Search by name or companyEmail
    const gasPlants = await GasPlant.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { companyEmail: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(20);
    
    res.json({
      success: true,
      count: gasPlants.length,
      gasPlants,
    });
  } catch (error) {
    console.error('Search gasPlants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while searching companies', 
      error: error.message 
    });
  }
});

// @route   GET /api/gasPlants/:ownerEmail
// @desc    Get gasPlant information
// @access  Private (Plant only)
router.get('/:ownerEmail', verifyPlantToken, async (req, res) => {
  try {
    const { ownerEmail } = req.params;
    
    console.log('Fetching gasPlant for ownerEmail:', ownerEmail);
    
    // Verify that the plant user is accessing their own record
    const user = await User.findById(req.user.id);
    if (!user || user.email !== ownerEmail) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only access your own company information.' 
      });
    }
    
    // Find the gasPlant record
    const gasPlant = await GasPlant.findOne({ ownerEmail });
    if (!gasPlant) {
      return res.status(404).json({ 
        success: false,
        message: 'GasPlant not found' 
      });
    }
    
    res.json({
      success: true,
      gasPlant,
    });
  } catch (error) {
    console.error('Get gasPlant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching company information', 
      error: error.message 
    });
  }
});

// @route   PUT /api/gasPlants/update/:ownerEmail
// @desc    Update gasPlant information
// @access  Private (Plant only)
router.put('/update/:ownerEmail', verifyPlantToken, async (req, res) => {
  try {
    const { ownerEmail } = req.params;
    const { name, phone, address, city, totalCapacity, currentStock, perKgPrice } = req.body;
    
    console.log('Updating gasPlant for ownerEmail:', ownerEmail);
    
    // Validate input
    if (!name && !phone && !address && !city && totalCapacity === undefined && currentStock === undefined && perKgPrice === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'At least one field is required for update' 
      });
    }
    
    // Validate email format if provided
    if (name && name.length > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Company name cannot exceed 100 characters' 
      });
    }
    
    if (phone && phone.length > 20) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number cannot exceed 20 characters' 
      });
    }
    
    if (address && address.length > 500) {
      return res.status(400).json({ 
        success: false,
        message: 'Address cannot exceed 500 characters' 
      });
    }
    
    // Verify that the plant user is updating their own record
    const user = await User.findById(req.user.id);
    if (!user || user.email !== ownerEmail) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only update your own company information.' 
      });
    }
    
    // Find and update the gasPlant record (upsert if not exists)
    let gasPlant = await GasPlant.findOne({ ownerEmail });
    if (!gasPlant) {
      gasPlant = new GasPlant({
        ownerEmail,
        companyEmail: ownerEmail,
        name: name || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
      });
    }
    
    // Update fields
    if (name !== undefined) gasPlant.name = name;
    if (phone !== undefined) gasPlant.phone = phone;
    if (address !== undefined) gasPlant.address = address;
    if (city !== undefined) gasPlant.city = city;
    if (totalCapacity !== undefined) gasPlant.totalCapacity = totalCapacity;
    if (currentStock !== undefined) gasPlant.currentStock = currentStock;
    if (perKgPrice !== undefined) gasPlant.perKgPrice = perKgPrice;
    
    // If there's an uploaded image, update the imageUrl
    if (req.file) {
      gasPlant.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedGasPlant = await gasPlant.save();
    console.log('GasPlant updated successfully');
    
    res.json({
      success: true,
      message: 'Company information updated successfully',
      gasPlant: updatedGasPlant,
    });
  } catch (error) {
    console.error('Update gasPlant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating company information', 
      error: error.message 
    });
  }
});

// @route   POST /api/gasPlants/upload-image/:ownerEmail
// @desc    Upload gasPlant image
// @access  Private (Plant only)
router.post('/upload-image/:ownerEmail', verifyPlantToken, upload.single('image'), async (req, res) => {
  try {
    const { ownerEmail } = req.params;
    
    console.log('Uploading image for gasPlant ownerEmail:', ownerEmail);
    
    // Verify that the plant user is updating their own record
    const user = await User.findById(req.user.id);
    if (!user || user.email !== ownerEmail) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only update your own company information.' 
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }
    
    // Find and update the gasPlant record (upsert if not exists)
    let gasPlant = await GasPlant.findOne({ ownerEmail });
    if (!gasPlant) {
      gasPlant = new GasPlant({ ownerEmail, companyEmail: ownerEmail });
    }
    
    // Update imageUrl
    gasPlant.imageUrl = `/uploads/${req.file.filename}`;
    const updatedGasPlant = await gasPlant.save();
    
    console.log('GasPlant image updated successfully');
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: gasPlant.imageUrl,
      gasPlant: updatedGasPlant,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while uploading image', 
      error: error.message 
    });
  }
});

module.exports = router;