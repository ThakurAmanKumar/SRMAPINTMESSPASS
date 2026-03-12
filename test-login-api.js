async function testLoginAPI() {
  try {
    console.log('🔍 Testing Super Admin Login API...\n');
    
    const response = await fetch('http://localhost:3002/api/superadmin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'amankumar_thakur@srmap.edu.in',
        password: 'aman1133',
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testLoginAPI();
