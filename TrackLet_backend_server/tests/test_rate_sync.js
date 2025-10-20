const mongoose = require('mongoose');
const GasPlant = require('./models/GasPlant');

// MongoDB connection string
const MONGO_URI = "mongodb+srv://waqasilyas:waqas5904@cluster0.ksdylvg.mongodb.net/test";

async function testRateSync() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Test updating all gas plants with a new rate
    const newRate = 275;
    console.log(`Updating all gas plants with new rate: ${newRate}`);
    
    const result = await GasPlant.updateMany(
      { status: 'active' },
      { perKgPrice: newRate }
    );
    
    console.log(`Updated ${result.modifiedCount} gas plants with new rate`);
    
    // Verify the update by fetching a few plants
    const plants = await GasPlant.find({ status: 'active' }).limit(5);
    console.log('Sample of updated plants:');
    plants.forEach(plant => {
      console.log(`  ${plant.name}: ${plant.perKgPrice}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRateSync();