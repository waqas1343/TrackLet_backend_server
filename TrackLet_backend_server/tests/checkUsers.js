const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function checkUsers() {
  try {
    // Removed console.log statements
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Removed console.log statements

    // Removed console.log statements
    const users = await User.find({});
    
    if (users.length === 0) {
      // Removed console.log statements
    } else {
      // Removed console.log statements
      users.forEach((user, index) => {
        // Removed console.log statements
      });
      // Removed console.log statements
    }
  } catch (error) {
    // Removed console.log statements
  } finally {
    await mongoose.connection.close();
    // Removed console.log statements
  }
}

checkUsers();