const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Health response:', healthResponse.data);
    
    console.log('\nTesting registration endpoint...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Registration response:', registerResponse.data);
    
    console.log('\nTesting login endpoint...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login response:', loginResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testAPI();