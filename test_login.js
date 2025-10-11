const axios = require('axios');

// Test login API
const testLogin = async () => {
  try {
    // First, let's try to register a user
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Registration Response:', registerResponse.data);
    
    // Then, let's try to login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login Response:', loginResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testLogin();