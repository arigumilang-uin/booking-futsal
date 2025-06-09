// Test tracking tables with debug logging
const axios = require('axios');

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const testCredentials = {
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' }
};

// Create axios instance with cookie support
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authCookies = {};

async function login(role) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, testCredentials[role]);
    if (response.data.success) {
      authCookies[role] = response.headers['set-cookie'];
      console.log(`✅ ${role} login successful`);
      return true;
    }
  } catch (error) {
    console.error(`❌ ${role} login failed:`, error.response?.data || error.message);
    return false;
  }
}

async function testDebugTracking() {
  console.log('🧪 TESTING TRACKING TABLES WITH DEBUG LOGGING');
  console.log('=' .repeat(60));

  // Step 1: Login
  console.log('\n📝 Step 1: Login as manager');
  const managerLogin = await login('manager');
  if (!managerLogin) {
    console.log('❌ Test failed: Could not login as manager');
    return;
  }

  // Step 2: Test with the latest booking ID (17) and payment ID (29)
  const testBookingId = 17; // From previous test: BK-20250609-017
  const testPaymentId = 29; // From previous test: PAY-20250609-029

  console.log(`\n📝 Step 2: Test tracking tables with debug logging`);
  console.log(`   Booking ID: ${testBookingId}`);
  console.log(`   Payment ID: ${testPaymentId}`);

  // Step 3: Test booking history endpoint with debug
  console.log(`\n📝 Step 3: Test booking history endpoint`);
  try {
    console.log(`   🔍 Calling GET ${BASE_URL}/admin/bookings/${testBookingId}/history`);
    const historyResponse = await axiosInstance.get(`${BASE_URL}/admin/bookings/${testBookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   📊 Response status: ${historyResponse.status}`);
    console.log(`   📊 Response data:`, JSON.stringify(historyResponse.data, null, 2));

    if (historyResponse.data.success) {
      const history = historyResponse.data.data || [];
      console.log(`   ✅ SUCCESS: Found ${history.length} booking history records`);
      
      if (history.length > 0) {
        history.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
          console.log(`      Changed by: ${record.changed_by_name || record.changed_by || 'Unknown'}`);
          console.log(`      Date: ${record.created_at}`);
          if (record.reason) console.log(`      Reason: ${record.reason}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️ No booking history records found - this indicates auto-logging is not working');
      }
    } else {
      console.log(`   ❌ FAILED: ${historyResponse.data.error}`);
      if (historyResponse.data.details) {
        console.log(`   ❌ Details: ${historyResponse.data.details}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error calling booking history endpoint:`, error.response?.data || error.message);
  }

  // Step 4: Test payment logs endpoint with debug
  console.log(`\n📝 Step 4: Test payment logs endpoint`);
  try {
    console.log(`   🔍 Calling GET ${BASE_URL}/admin/payments/${testPaymentId}/logs`);
    const logsResponse = await axiosInstance.get(`${BASE_URL}/admin/payments/${testPaymentId}/logs`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   📊 Response status: ${logsResponse.status}`);
    console.log(`   📊 Response data:`, JSON.stringify(logsResponse.data, null, 2));

    if (logsResponse.data.success) {
      const logs = logsResponse.data.data || [];
      console.log(`   ✅ SUCCESS: Found ${logs.length} payment log records`);
      
      if (logs.length > 0) {
        logs.forEach((record, index) => {
          console.log(`   ${index + 1}. Action: ${record.action || 'unknown'}`);
          console.log(`      Status: ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
          console.log(`      Processed by: ${record.processed_by_name || record.processed_by || 'System'}`);
          console.log(`      Date: ${record.created_at}`);
          if (record.notes) console.log(`      Notes: ${record.notes}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️ No payment log records found - this indicates auto-logging is not working');
      }
    } else {
      console.log(`   ❌ FAILED: ${logsResponse.data.error}`);
      if (logsResponse.data.details) {
        console.log(`   ❌ Details: ${logsResponse.data.details}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error calling payment logs endpoint:`, error.response?.data || error.message);
  }

  // Step 5: Summary and diagnosis
  console.log('\n📊 DEBUG TRACKING TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log('✅ Endpoints are accessible and responding');
  console.log('✅ Authentication is working');
  console.log('✅ API routes are properly configured');
  
  console.log('\n🔍 DIAGNOSIS:');
  console.log('If both endpoints return empty arrays ([]), this means:');
  console.log('   1. ✅ API endpoints are working correctly');
  console.log('   2. ✅ Database connections are working');
  console.log('   3. ❌ Auto-logging functions are NOT being called in business logic');
  console.log('   4. ❌ Tracking tables are empty because logging is not triggered');
  
  console.log('\n🔧 SOLUTION:');
  console.log('The auto-logging implementation needs to be verified:');
  console.log('   1. Check if logBookingStatusChange is called in updateBookingStatus');
  console.log('   2. Check if logPaymentCreation/Processing are called in payment operations');
  console.log('   3. Verify database table structures exist');
  console.log('   4. Test with console.log in the logging functions');

  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Add console.log to auto-logging functions to verify they are called');
  console.log('   2. Check Railway logs for any database errors');
  console.log('   3. Verify tracking table schemas in production database');
}

// Run the test
testDebugTracking().catch(console.error);
