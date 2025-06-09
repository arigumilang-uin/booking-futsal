// Test tracking tables for specific booking and payment IDs
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

async function checkBookingHistory(bookingId) {
  try {
    console.log(`   🔍 Checking booking history for booking ID: ${bookingId}`);
    const response = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   📋 Response status: ${response.status}`);
    console.log(`   📋 Response data:`, response.data);

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`   ❌ Failed to get booking history for ${bookingId}:`, error.response?.data || error.message);
    return [];
  }
}

async function checkBookingTimeline(bookingId) {
  try {
    console.log(`   🔍 Checking booking timeline for booking ID: ${bookingId}`);
    const response = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/timeline`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   📅 Timeline response status: ${response.status}`);
    console.log(`   📅 Timeline response data:`, response.data);

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`   ❌ Failed to get booking timeline for ${bookingId}:`, error.response?.data || error.message);
    return [];
  }
}

async function checkPaymentLogs(paymentId) {
  try {
    console.log(`   🔍 Checking payment logs for payment ID: ${paymentId}`);
    const response = await axiosInstance.get(`${BASE_URL}/admin/payments/${paymentId}/logs`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log(`   💳 Payment logs response status: ${response.status}`);
    console.log(`   💳 Payment logs response data:`, response.data);

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`   ❌ Failed to get payment logs for ${paymentId}:`, error.response?.data || error.message);
    return [];
  }
}

async function testSpecificTrackingTables() {
  console.log('🧪 TESTING SPECIFIC TRACKING TABLES');
  console.log('=' .repeat(60));
  console.log('Testing booking_history and payment_logs for specific IDs');
  console.log('=' .repeat(60));

  // Step 1: Login
  console.log('\n📝 Step 1: Login as manager');
  const managerLogin = await login('manager');
  if (!managerLogin) {
    console.log('❌ Test failed: Could not login as manager');
    return;
  }

  // Step 2: Test with the booking and payment IDs from the previous test
  const testBookingId = 16; // From previous test: BK-20250609-016
  const testPaymentId = 28; // From previous test: PAY-20250609-028

  console.log(`\n📝 Step 2: Test tracking tables for specific IDs`);
  console.log(`   Booking ID: ${testBookingId}`);
  console.log(`   Payment ID: ${testPaymentId}`);

  // Step 3: Check booking history
  console.log(`\n📝 Step 3: Check booking history for booking ${testBookingId}`);
  const bookingHistory = await checkBookingHistory(testBookingId);
  console.log(`\n   📊 Booking History Results:`);
  console.log(`   Found ${bookingHistory.length} history records`);
  
  if (bookingHistory.length > 0) {
    bookingHistory.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
      console.log(`      Changed by: ${record.changed_by_name || record.changed_by || 'Unknown'}`);
      console.log(`      Date: ${record.created_at}`);
      if (record.reason) console.log(`      Reason: ${record.reason}`);
      if (record.notes) console.log(`      Notes: ${record.notes}`);
      console.log('');
    });
  } else {
    console.log('   ❌ No booking history records found');
  }

  // Step 4: Check booking timeline
  console.log(`\n📝 Step 4: Check booking timeline for booking ${testBookingId}`);
  const bookingTimeline = await checkBookingTimeline(testBookingId);
  console.log(`\n   📊 Booking Timeline Results:`);
  console.log(`   Found ${bookingTimeline.length} timeline events`);
  
  if (bookingTimeline.length > 0) {
    bookingTimeline.forEach((event, index) => {
      console.log(`   ${index + 1}. Event: ${event.event_type || 'unknown'}`);
      console.log(`      Status: ${event.status_from || 'N/A'} → ${event.status_to || 'N/A'}`);
      console.log(`      Actor: ${event.actor_name || 'Unknown'}`);
      console.log(`      Date: ${event.created_at}`);
      console.log('');
    });
  } else {
    console.log('   ❌ No timeline events found');
  }

  // Step 5: Check payment logs
  console.log(`\n📝 Step 5: Check payment logs for payment ${testPaymentId}`);
  const paymentLogs = await checkPaymentLogs(testPaymentId);
  console.log(`\n   📊 Payment Logs Results:`);
  console.log(`   Found ${paymentLogs.length} log records`);
  
  if (paymentLogs.length > 0) {
    paymentLogs.forEach((record, index) => {
      console.log(`   ${index + 1}. Action: ${record.action || 'unknown'}`);
      console.log(`      Status: ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
      console.log(`      Processed by: ${record.processed_by_name || record.processed_by || 'System'}`);
      console.log(`      Date: ${record.created_at}`);
      if (record.notes) console.log(`      Notes: ${record.notes}`);
      console.log('');
    });
  } else {
    console.log('   ❌ No payment log records found');
  }

  // Step 6: Summary
  console.log('\n📊 TRACKING TABLES TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Booking History Records: ${bookingHistory.length}`);
  console.log(`✅ Timeline Events: ${bookingTimeline.length}`);
  console.log(`✅ Payment Log Records: ${paymentLogs.length}`);

  if (bookingHistory.length > 0 || paymentLogs.length > 0) {
    console.log('\n🎉 SUCCESS: Tracking tables are working!');
    if (bookingHistory.length > 0) {
      console.log('✅ booking_history table is populated and accessible');
    }
    if (paymentLogs.length > 0) {
      console.log('✅ payment_logs table is populated and accessible');
    }
    if (bookingTimeline.length > 0) {
      console.log('✅ booking timeline API is working');
    }
    console.log('✅ Auto-logging implementation is functioning correctly');
  } else {
    console.log('\n❌ ISSUE: No tracking data found');
    console.log('   Possible causes:');
    console.log('   - Auto-logging functions are not being called');
    console.log('   - Database triggers are not working');
    console.log('   - API endpoints have issues');
    console.log('   - The test booking/payment IDs are incorrect');
  }

  console.log('\n🔍 NEXT STEPS:');
  if (bookingHistory.length === 0 && paymentLogs.length === 0) {
    console.log('   1. Check if the auto-logging functions are properly integrated');
    console.log('   2. Verify database table structures');
    console.log('   3. Test with a fresh booking creation');
  } else {
    console.log('   1. Integrate timeline features into frontend');
    console.log('   2. Add tracking tables to manager dashboard');
    console.log('   3. Implement audit trail visualization');
  }
}

// Run the test
testSpecificTrackingTables().catch(console.error);
