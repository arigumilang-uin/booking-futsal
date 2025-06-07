// debug/quick-data-test.js
// Quick test to verify supervisor data loading

console.log('🚀 QUICK SUPERVISOR DATA TEST');
console.log('==============================\n');

// Test with cookies from previous login
const testEndpoints = async () => {
  const baseUrl = 'https://booking-futsal-production.up.railway.app/api';
  
  // Test endpoints that should return data
  const endpoints = [
    '/staff/supervisor/dashboard',
    '/admin/users', 
    '/admin/fields',
    '/admin/notifications',
    '/admin/promotions'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${endpoint}`);
        
        if (endpoint === '/staff/supervisor/dashboard') {
          console.log(`   📊 Overview:`, data.data?.overview);
          console.log(`   📈 Statistics:`, data.data?.statistics);
        } else if (endpoint === '/admin/users') {
          console.log(`   👥 Users count: ${data.data?.users?.length || 0}`);
        } else if (endpoint === '/admin/fields') {
          console.log(`   🏟️ Fields count: ${Array.isArray(data.data) ? data.data.length : 0}`);
        } else if (endpoint === '/admin/notifications') {
          console.log(`   🔔 Notifications count: ${data.data?.notifications?.length || 0}`);
        } else if (endpoint === '/admin/promotions') {
          console.log(`   🎯 Promotions count: ${data.data?.promotions?.length || 0}`);
        }
      } else {
        console.log(`❌ FAILED: ${endpoint} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${endpoint} - ${error.message}`);
    }
  }
};

// Run test
testEndpoints();
