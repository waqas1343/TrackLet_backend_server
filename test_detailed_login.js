const axios = require('axios');

// Test login with detailed logging
async function testLogin() {
  console.log('Testing login API with detailed logging...');
  
  try {
    console.log('Making request to login endpoint...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'distributor@tracklet.com',
      password: '123456'
    });
    
    console.log('Login Response Status:', response.status);
    console.log('Login Response Data:', JSON.stringify(response.data, null, 2));
    
    // Test with gas plant user
    console.log('\n--- Testing with gas plant user ---');
    const response2 = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'plant@tracklet.com',
      password: '123456'
    });
    
    console.log('Login Response Status:', response2.status);
    console.log('Login Response Data:', JSON.stringify(response2.data, null, 2));
  } catch (error) {
    console.error('Error during login test:');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('Request data:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testLogin();