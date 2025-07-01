// Test script to check API authentication and data segregation for test user
const credentials = {
  email: 'test1@landlordos.co',
  password: 'test123'
};

console.log('Testing with test1@landlordos.co...');

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
    console.log('\nFetching leases for test1@landlordos.co...');
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
  console.log('Leases response for test1@landlordos.co:');
  console.log('Number of leases:', data.leases.length);
  data.leases.forEach((lease, index) => {
    console.log(`Lease ${index + 1}:`, {
      id: lease.id,
      propertyAddress: lease.propertyAddress,
      tenantName: lease.tenantName,
      monthlyRent: lease.monthlyRent
    });
  });
})
.catch(error => {
  console.error('Error:', error);
});
