const axios = require('axios');

// Test the login API with different user roles
const testLoginWithRoles = async () => {
  const baseURL = 'http://localhost:5000/api/auth';
  
  try {
    console.log('Testing Login API with Roles...\n');
    
    // Test login with gas plant user
    console.log('1. Testing gas plant user login...');
    const gasPlantResponse = await axios.post(`${baseURL}/login`, {
      email: 'plant@tracklet.com',
      password: '12345678'
    });
    console.log('Gas Plant Login Response:', gasPlantResponse.data);
    console.log('User Role:', gasPlantResponse.data.user?.role);
    
    // Test login with distributor user
    console.log('\n2. Testing distributor user login...');
    const distributorResponse = await axios.post(`${baseURL}/login`, {
      email: 'distributor@tracklet.com',
      password: '12345678'
    });
    console.log('Distributor Login Response:', distributorResponse.data);
    console.log('User Role:', distributorResponse.data.user?.role);
    
    console.log('\n✅ Login tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testLoginWithRoles();