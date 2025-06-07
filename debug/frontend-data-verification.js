// debug/frontend-data-verification.js
// Script to verify frontend data loading matches backend responses

console.log('🚀 FRONTEND DATA VERIFICATION SCRIPT');
console.log('====================================\n');

// Simulate frontend API calls to verify data structure
const testFrontendDataLoading = async () => {
  const baseUrl = 'https://booking-futsal-production.up.railway.app/api';
  
  // Login first to get authentication
  console.log('🔐 Step 1: Login as supervisor...');
  try {
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ppwweebb01@gmail.com',
        password: 'futsaluas'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.role);
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');
    
    // Test supervisor dashboard endpoint
    console.log('\n📊 Step 2: Testing supervisor dashboard endpoint...');
    const dashboardResponse = await fetch(`${baseUrl}/staff/supervisor/dashboard`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard endpoint successful');
      console.log('📈 Overview data:', dashboardData.data?.overview);
      console.log('📊 Statistics data:', dashboardData.data?.statistics);
      
      // Extract key metrics that should appear in frontend
      const overview = dashboardData.data?.overview;
      if (overview) {
        console.log('\n🎯 KEY METRICS FOR FRONTEND:');
        console.log(`   Total Users: ${overview.total_users}`);
        console.log(`   Total Fields: ${overview.total_fields}`);
        console.log(`   Total Bookings: ${overview.total_bookings}`);
        console.log(`   Total Revenue: ${overview.total_revenue}`);
        console.log(`   Active Fields: ${overview.active_fields}`);
        console.log(`   Total Staff: ${overview.total_staff}`);
      }
      
      // Test user role breakdown
      const userStats = dashboardData.data?.statistics?.users;
      if (userStats) {
        console.log('\n👥 USER ROLE BREAKDOWN:');
        console.log(`   Total Users: ${userStats.total}`);
        console.log(`   Active Users: ${userStats.active}`);
        console.log(`   By Role:`, userStats.by_role);
      }
    } else {
      console.log('❌ Dashboard endpoint failed:', dashboardResponse.status);
    }
    
    // Test admin users endpoint
    console.log('\n👥 Step 3: Testing admin users endpoint...');
    const usersResponse = await fetch(`${baseUrl}/admin/users`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users endpoint successful');
      console.log(`📊 Users count: ${usersData.data?.users?.length || 0}`);
      if (usersData.data?.users?.length > 0) {
        console.log('👤 Sample user:', {
          name: usersData.data.users[0].name,
          role: usersData.data.users[0].role,
          email: usersData.data.users[0].email
        });
      }
    } else {
      console.log('❌ Users endpoint failed:', usersResponse.status);
    }
    
    // Test admin fields endpoint
    console.log('\n🏟️ Step 4: Testing admin fields endpoint...');
    const fieldsResponse = await fetch(`${baseUrl}/admin/fields`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (fieldsResponse.ok) {
      const fieldsData = await fieldsResponse.json();
      console.log('✅ Fields endpoint successful');
      console.log(`📊 Fields count: ${Array.isArray(fieldsData.data) ? fieldsData.data.length : 0}`);
      if (Array.isArray(fieldsData.data) && fieldsData.data.length > 0) {
        console.log('🏟️ Sample field:', {
          name: fieldsData.data[0].name,
          type: fieldsData.data[0].type,
          status: fieldsData.data[0].status,
          price: fieldsData.data[0].price
        });
      }
    } else {
      console.log('❌ Fields endpoint failed:', fieldsResponse.status);
    }
    
    // Test notifications endpoint
    console.log('\n🔔 Step 5: Testing admin notifications endpoint...');
    const notificationsResponse = await fetch(`${baseUrl}/admin/notifications`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      console.log('✅ Notifications endpoint successful');
      console.log(`📊 Notifications count: ${notificationsData.data?.notifications?.length || 0}`);
    } else {
      console.log('❌ Notifications endpoint failed:', notificationsResponse.status);
    }
    
    // Test promotions endpoint
    console.log('\n🎯 Step 6: Testing admin promotions endpoint...');
    const promotionsResponse = await fetch(`${baseUrl}/admin/promotions`, {
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json'
      }
    });
    
    if (promotionsResponse.ok) {
      const promotionsData = await promotionsResponse.json();
      console.log('✅ Promotions endpoint successful');
      console.log(`📊 Promotions count: ${promotionsData.data?.promotions?.length || 0}`);
    } else {
      console.log('❌ Promotions endpoint failed:', promotionsResponse.status);
    }
    
    console.log('\n🎯 EXPECTED FRONTEND VALUES:');
    console.log('============================');
    console.log('Based on backend data, frontend should show:');
    console.log('• Total Users: 6');
    console.log('• Total Fields: 5');
    console.log('• Total Bookings: 0 (no active bookings)');
    console.log('• Total Revenue: 0 (no revenue from bookings)');
    console.log('• Active Fields: 2');
    console.log('• Notifications: 2');
    console.log('• Promotions: 2');
    
    console.log('\n💡 FRONTEND DEBUGGING TIPS:');
    console.log('============================');
    console.log('1. Check browser console for API call logs');
    console.log('2. Verify authentication cookies are being sent');
    console.log('3. Check if data mapping matches backend response structure');
    console.log('4. Ensure state updates are triggering UI re-renders');
    console.log('5. Verify component lifecycle and useEffect dependencies');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testFrontendDataLoading();
