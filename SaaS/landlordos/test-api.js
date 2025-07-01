// Test script to check API authentication and data segregation
// This will be run from PowerShell using node

const credentials = {
  email: 'demo@landlordos.com',
  password: 'demo123'
};

// First, login to get a token
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials)
})
.then(response => response.json())
.then(data => {
  console.log('Login response:', data);
  
  if (data.token) {
    // Now fetch leases to trigger our debugging
    return fetch('http://localhost:5000/api/leases', {
      headers: {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json',
      }
    });
  } else {
    throw new Error('No token received');
  }
})
.then(response => response.json())
.then(data => {
  console.log('Leases response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
