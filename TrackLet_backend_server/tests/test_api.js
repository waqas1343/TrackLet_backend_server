const http = require('http');

// Test super admin login
const loginData = JSON.stringify({
  email: 'agha@tracklet.com',
  password: '123123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/super-admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Login Response Status:', res.statusCode);
    console.log('Login Response Headers:', res.headers);
    console.log('Login Response Body:', data);
    
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      const token = response.token;
      
      if (token) {
        console.log('Token received:', token);
        
        // Now test user creation
        const userData = JSON.stringify({
          email: 'api_test@example.com',
          role: 'distributor'
        });
        
        const userOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/users',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Content-Length': Buffer.byteLength(userData)
          }
        };
        
        const userReq = http.request(userOptions, (userRes) => {
          let userDataResponse = '';
          
          userRes.on('data', (chunk) => {
            userDataResponse += chunk;
          });
          
          userRes.on('end', () => {
            console.log('User Creation Response Status:', userRes.statusCode);
            console.log('User Creation Response Headers:', userRes.headers);
            console.log('User Creation Response Body:', userDataResponse);
          });
        });
        
        userReq.on('error', (error) => {
          console.error('User Creation Error:', error);
        });
        
        userReq.write(userData);
        userReq.end();
      }
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Login Error:', error);
});

loginReq.write(loginData);
loginReq.end();