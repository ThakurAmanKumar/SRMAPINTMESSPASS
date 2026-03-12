const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing Super Admin Login API...\n');
    
    const response = await axios.post('http://localhost:3001/api/superadmin/auth/login', {
      email: 'amankumar_thakur@srmap.edu.in',
      password: 'aman1133'
    }, {
      validateStatus: () => true // Don't throw on any status
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
