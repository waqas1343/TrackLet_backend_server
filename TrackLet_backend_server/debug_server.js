console.log('Starting debug server...');

// Try to import each module one by one to see where the issue is
try {
  console.log('Importing express...');
  const express = require('express');
  console.log('Express imported successfully');
  
  console.log('Importing mongoose...');
  const mongoose = require('mongoose');
  console.log('Mongoose imported successfully');
  
  console.log('Importing cors...');
  const cors = require('cors');
  console.log('Cors imported successfully');
  
  console.log('Importing dotenv...');
  const dotenv = require('dotenv');
  console.log('Dotenv imported successfully');
  
  console.log('Importing path...');
  const path = require('path');
  console.log('Path imported successfully');
  
  console.log('Importing http...');
  const http = require('http');
  console.log('Http imported successfully');
  
  console.log('Loading environment variables...');
  dotenv.config();
  console.log('Environment variables loaded');
  
  // Try to import routes one by one
  console.log('Importing auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('Auth routes imported successfully');
  
  console.log('Importing login routes...');
  const loginRoutes = require('./routes/login');
  console.log('Login routes imported successfully');
  
  console.log('Importing user routes...');
  const userRoutes = require('./routes/users');
  console.log('User routes imported successfully');
  
  console.log('Importing company routes...');
  const companyRoutes = require('./routes/companies');
  console.log('Company routes imported successfully');
  
  console.log('Importing gasPlant routes...');
  const gasPlantRoutes = require('./routes/gasPlants');
  console.log('GasPlant routes imported successfully');
  
  console.log('Importing order routes...');
  const orderRoutes = require('./routes/orders');
  console.log('Order routes imported successfully');
  
  console.log('Importing rate routes...');
  const rateRoutes = require('./routes/rates');
  console.log('Rate routes imported successfully');
  
  console.log('Importing tank routes...');
  const tankRoutes = require('./routes/tanks');
  console.log('Tank routes imported successfully');
  
  console.log('Importing expense routes...');
  const expenseRoutes = require('./routes/expenses');
  console.log('Expense routes imported successfully');
  
  console.log('Importing notification routes...');
  const notificationRoutes = require('./routes/notifications');
  console.log('Notification routes imported successfully');
  
  console.log('Importing driver routes...');
  const driverRoutes = require('./routes/drivers');
  console.log('Driver routes imported successfully');
  
  console.log('Importing connectDB...');
  const connectDB = require('./config/db');
  console.log('ConnectDB imported successfully');
  
  console.log('Importing initSocket...');
  const { initSocket } = require('./utils/socket');
  console.log('InitSocket imported successfully');
  
  console.log('All imports successful!');
  
} catch (error) {
  console.error('Error during import:', error);
}