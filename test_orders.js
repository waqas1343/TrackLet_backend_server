const axios = require('axios');

// Test the orders API
const testOrdersAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing Orders API...\n');
    
    // Test creating an order
    console.log('1. Creating a new order...');
    const orderData = {
      distributorId: 'dist_123',
      distributorName: 'Test Distributor',
      plantId: 'plant_456',
      plantName: 'Test Gas Plant',
      plantImageUrl: 'https://example.com/plant.jpg',
      items: [
        { weight: 15.0, quantity: 2 },
        { weight: 11.8, quantity: 3 }
      ],
      specialInstructions: 'Please deliver after 2 PM',
      totalKg: 65.4,
      totalPrice: 16350
    };
    
    const createResponse = await axios.post(`${baseURL}/orders`, orderData);
    console.log('Order created successfully:', createResponse.data);
    const orderId = createResponse.data._id;
    
    // Test getting orders for a plant
    console.log('\n2. Getting orders for plant...');
    const getResponse = await axios.get(`${baseURL}/orders/plant/plant_456`);
    console.log(`Found ${getResponse.data.length} orders for plant`);
    
    // Test accepting an order
    console.log('\n3. Accepting the order...');
    const acceptResponse = await axios.put(`${baseURL}/orders/${orderId}/accept`, {
      driverName: 'Test Driver'
    });
    console.log('Order accepted:', acceptResponse.data.status);
    
    // Test completing an order
    console.log('\n4. Completing the order...');
    const completeResponse = await axios.put(`${baseURL}/orders/${orderId}/complete`);
    console.log('Order completed:', completeResponse.data.status);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testOrdersAPI();