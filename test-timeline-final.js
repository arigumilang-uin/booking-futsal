// Final test for timeline endpoint after schema fix
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

async function testTimelineEndpoint() {
  console.log('🧪 TESTING TIMELINE ENDPOINT AFTER SCHEMA FIX');
  console.log('=' .repeat(60));

  // Step 1: Login
  console.log('\n📝 Step 1: Login as manager');
  const managerLogin = await login('manager');
  if (!managerLogin) {
    console.log('❌ Test failed: Could not login as manager');
    return;
  }

  // Step 2: Test timeline endpoint with the latest booking ID (18)
  const testBookingId = 18; // From previous test: BK-20250609-018

  console.log(`\n📝 Step 2: Test timeline endpoint for booking ${testBookingId}`);

  // Test booking history endpoint
  console.log(`\n📋 Testing booking history endpoint:`);
  try {
    const historyResponse = await axiosInstance.get(`${BASE_URL}/admin/bookings/${testBookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   Status: ${historyResponse.status}`);
    if (historyResponse.data.success) {
      const history = historyResponse.data.data || [];
      console.log(`   ✅ SUCCESS: Found ${history.length} booking history records`);
      
      if (history.length > 0) {
        history.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.old_status || 'N/A'} → ${record.new_status || 'N/A'} (${record.action || 'unknown'})`);
          console.log(`      Changed by: ${record.changed_by_name || record.changed_by || 'Unknown'}`);
          console.log(`      Date: ${record.created_at}`);
          if (record.notes) console.log(`      Notes: ${record.notes}`);
          console.log('');
        });
      }
    } else {
      console.log(`   ❌ FAILED: ${historyResponse.data.error}`);
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.response?.data || error.message);
  }

  // Test timeline endpoint
  console.log(`\n📅 Testing timeline endpoint:`);
  try {
    const timelineResponse = await axiosInstance.get(`${BASE_URL}/admin/bookings/${testBookingId}/timeline`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   Status: ${timelineResponse.status}`);
    if (timelineResponse.data.success) {
      const timeline = timelineResponse.data.data || [];
      console.log(`   ✅ SUCCESS: Found ${timeline.length} timeline events`);
      
      if (timeline.length > 0) {
        timeline.forEach((event, index) => {
          console.log(`   ${index + 1}. Event: ${event.event_type} (${event.action || 'unknown'})`);
          console.log(`      Status: ${event.status_from || 'N/A'} → ${event.status_to || 'N/A'}`);
          console.log(`      Actor: ${event.actor_name || 'Unknown'} (${event.actor_role || 'N/A'})`);
          console.log(`      Date: ${event.created_at}`);
          if (event.notes) console.log(`      Notes: ${event.notes}`);
          console.log('');
        });
      }
    } else {
      console.log(`   ❌ FAILED: ${timelineResponse.data.error}`);
      if (timelineResponse.data.details) {
        console.log(`   ❌ Details: ${timelineResponse.data.details}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.response?.data || error.message);
  }

  // Summary
  console.log('\n📊 TIMELINE TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log('✅ Timeline endpoint schema fix verification completed');
  console.log('✅ Both booking history and timeline endpoints tested');
  console.log('\n🎯 Expected Results:');
  console.log('   - Booking history: Should show status changes with correct schema');
  console.log('   - Timeline: Should combine booking history + payment events');
  console.log('   - No more "column does not exist" errors');
  
  console.log('\n🚀 If both endpoints work without errors:');
  console.log('   ✅ Schema mismatch issues are completely resolved');
  console.log('   ✅ Tracking tables implementation is fully functional');
  console.log('   ✅ Ready for frontend integration');
}

// Run the test
testTimelineEndpoint().catch(console.error);
