// debug/supervisor-data-verification.js
// Comprehensive data verification script for supervisor frontend

const API_BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'ppwweebb01@gmail.com',
  password: 'futsaluas'
};

async function loginAndGetToken() {
  try {
    console.log('🔐 Logging in as supervisor...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data.user.role);
      
      // Extract token from Set-Cookie header
      const cookies = response.headers.get('set-cookie');
      let token = null;
      
      if (cookies) {
        const tokenMatch = cookies.match(/auth_token=([^;]+)/);
        if (tokenMatch) {
          token = tokenMatch[1];
        }
      }
      
      return { user: data.user, token };
    } else {
      throw new Error(`Login failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

async function testEndpoint(endpoint, token, description) {
  try {
    console.log(`\n🔍 Testing ${description}...`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${description} - SUCCESS`);
      
      // Analyze data structure
      if (data.success) {
        if (Array.isArray(data.data)) {
          console.log(`   📊 Data: Array with ${data.data.length} items`);
          if (data.data.length > 0) {
            console.log(`   📋 Sample item keys:`, Object.keys(data.data[0]));
          }
        } else if (data.data && typeof data.data === 'object') {
          console.log(`   📊 Data: Object with keys:`, Object.keys(data.data));
          
          // Special handling for different data structures
          if (data.data.users) {
            console.log(`   👥 Users count: ${data.data.users.length}`);
          }
          if (data.data.overview) {
            console.log(`   📈 Overview:`, data.data.overview);
          }
          if (data.data.statistics) {
            console.log(`   📊 Statistics:`, data.data.statistics);
          }
          if (data.data.notifications) {
            console.log(`   🔔 Notifications count: ${data.data.notifications.length}`);
          }
          if (data.data.promotions) {
            console.log(`   🎯 Promotions count: ${data.data.promotions.length}`);
          }
        }
        
        if (data.pagination) {
          console.log(`   📄 Pagination:`, data.pagination);
        }
      }
      
      return { success: true, data: data.data, response: data };
    } else {
      console.log(`❌ ${description} - FAILED: ${response.status} ${response.statusText}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 SUPERVISOR FRONTEND DATA VERIFICATION');
  console.log('==========================================\n');

  // Step 1: Login
  const auth = await loginAndGetToken();
  if (!auth || !auth.token) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }

  const { token } = auth;

  // Step 2: Test all critical endpoints
  const endpoints = [
    {
      endpoint: '/staff/supervisor/dashboard',
      description: 'Supervisor Dashboard (Main Stats)'
    },
    {
      endpoint: '/admin/users',
      description: 'Admin Users (User Management)'
    },
    {
      endpoint: '/admin/fields',
      description: 'Admin Fields (Field Management)'
    },
    {
      endpoint: '/admin/notifications',
      description: 'Admin Notifications (Notification Management)'
    },
    {
      endpoint: '/admin/promotions',
      description: 'Admin Promotions (Promotion Management)'
    },
    {
      endpoint: '/admin/analytics/business',
      description: 'Business Analytics (Advanced Analytics)'
    },
    {
      endpoint: '/staff/manager/revenue',
      description: 'Revenue Analytics (Manager Level)'
    },
    {
      endpoint: '/staff/manager/bookings-report',
      description: 'Booking Reports (Manager Level)'
    },
    {
      endpoint: '/staff/manager/staff-performance',
      description: 'Staff Performance (Manager Level)'
    },
    {
      endpoint: '/staff/kasir/statistics',
      description: 'Kasir Statistics (Payment Data)'
    }
  ];

  const results = {};
  
  for (const { endpoint, description } of endpoints) {
    const result = await testEndpoint(endpoint, token, description);
    results[endpoint] = result;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 3: Summary Report
  console.log('\n📋 VERIFICATION SUMMARY');
  console.log('========================');
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful endpoints: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  
  if (successful < total) {
    console.log('\n❌ Failed endpoints:');
    Object.entries(results).forEach(([endpoint, result]) => {
      if (!result.success) {
        console.log(`   ${endpoint}: ${result.status || result.error}`);
      }
    });
  }

  // Step 4: Data Mapping Verification
  console.log('\n🔍 DATA MAPPING VERIFICATION');
  console.log('=============================');
  
  const dashboardResult = results['/staff/supervisor/dashboard'];
  if (dashboardResult && dashboardResult.success) {
    const data = dashboardResult.response.data;
    
    console.log('📊 Dashboard Data Structure:');
    console.log('   Overview:', data.overview ? '✅' : '❌');
    console.log('   Statistics:', data.statistics ? '✅' : '❌');
    console.log('   System Health:', data.system_health ? '✅' : '❌');
    console.log('   Database Stats:', data.database_stats ? '✅' : '❌');
    
    if (data.overview) {
      console.log('\n📈 Overview Metrics:');
      console.log(`   Total Users: ${data.overview.total_users}`);
      console.log(`   Total Fields: ${data.overview.total_fields}`);
      console.log(`   Total Bookings: ${data.overview.total_bookings}`);
      console.log(`   Total Revenue: ${data.overview.total_revenue}`);
      console.log(`   Active Fields: ${data.overview.active_fields}`);
    }
    
    if (data.statistics && data.statistics.users) {
      console.log('\n👥 User Statistics:');
      console.log(`   Total: ${data.statistics.users.total}`);
      console.log(`   By Role:`, data.statistics.users.by_role);
    }
  }

  // Step 5: Frontend Mapping Recommendations
  console.log('\n💡 FRONTEND MAPPING RECOMMENDATIONS');
  console.log('====================================');
  
  console.log('✅ Use these data paths in frontend components:');
  console.log('   Dashboard Stats: data.overview.{total_users, total_fields, total_bookings, total_revenue}');
  console.log('   User Management: data.users (array from /admin/users)');
  console.log('   Field Management: data (array from /admin/fields)');
  console.log('   Notifications: data.notifications (array from /admin/notifications)');
  console.log('   Promotions: data.promotions (array from /admin/promotions)');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Verify frontend components use correct data paths');
  console.log('2. Add console.log statements to debug data loading');
  console.log('3. Check browser network tab for API call responses');
  console.log('4. Ensure proper error handling for failed requests');
  
  return results;
}

// Run the test
runComprehensiveTest().catch(console.error);
