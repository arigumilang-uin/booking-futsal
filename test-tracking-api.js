// Test tracking tables via API endpoints
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

async function getRecentBookings() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/staff/manager/bookings?limit=5`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log(`   Debug: Manager bookings response structure:`, {
        success: response.data.success,
        dataType: typeof response.data.data,
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'not array',
        firstItem: response.data.data?.[0] ? { id: response.data.data[0].id, booking_number: response.data.data[0].booking_number } : 'no items'
      });
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get recent bookings:', error.response?.data || error.message);
    return [];
  }
}

async function checkBookingHistory(bookingId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`❌ Failed to get booking history for ${bookingId}:`, error.response?.data || error.message);
    return [];
  }
}

async function checkBookingTimeline(bookingId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/timeline`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`❌ Failed to get booking timeline for ${bookingId}:`, error.response?.data || error.message);
    return [];
  }
}

async function getRecentPayments() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/staff/kasir/payments?limit=5`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get recent payments:', error.response?.data || error.message);
    return [];
  }
}

async function checkPaymentLogs(paymentId) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/admin/payments/${paymentId}/logs`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`❌ Failed to get payment logs for ${paymentId}:`, error.response?.data || error.message);
    return [];
  }
}

async function testTrackingTablesViaAPI() {
  console.log('🧪 TESTING TRACKING TABLES VIA API');
  console.log('='.repeat(60));
  console.log('Checking booking_history and payment_logs via API endpoints');
  console.log('='.repeat(60));

  // Step 1: Login
  console.log('\n📝 Step 1: Login as manager');
  const managerLogin = await login('manager');
  if (!managerLogin) {
    console.log('❌ Test failed: Could not login as manager');
    return;
  }

  // Step 2: Get recent bookings
  console.log('\n📝 Step 2: Get recent bookings');
  const recentBookings = await getRecentBookings();
  console.log(`✅ Found ${recentBookings.length} recent bookings`);

  if (recentBookings.length === 0) {
    console.log('❌ No bookings found to test tracking tables');
    return;
  }

  // Step 3: Check booking history for each recent booking
  console.log('\n📝 Step 3: Check booking history for recent bookings');
  let totalHistoryRecords = 0;

  for (let i = 0; i < Math.min(3, recentBookings.length); i++) {
    const booking = recentBookings[i];
    console.log(`\n   📋 Checking booking ${booking.booking_number || booking.id}:`);

    const history = await checkBookingHistory(booking.id);
    console.log(`      Found ${history.length} history records`);

    if (history.length > 0) {
      totalHistoryRecords += history.length;
      history.forEach((record, index) => {
        console.log(`      ${index + 1}. ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
        console.log(`         Changed by: ${record.changed_by_name || 'Unknown'} at ${record.created_at}`);
        if (record.reason) console.log(`         Reason: ${record.reason}`);
      });
    } else {
      console.log(`      ❌ No history records found for booking ${booking.booking_number || booking.id}`);
    }

    // Also check timeline
    const timeline = await checkBookingTimeline(booking.id);
    console.log(`      Timeline events: ${timeline.length}`);
  }

  // Step 4: Get recent payments
  console.log('\n📝 Step 4: Get recent payments');
  const recentPayments = await getRecentPayments();
  console.log(`✅ Found ${recentPayments.length} recent payments`);

  // Step 5: Check payment logs for recent payments
  console.log('\n📝 Step 5: Check payment logs for recent payments');
  let totalPaymentLogs = 0;

  for (let i = 0; i < Math.min(3, recentPayments.length); i++) {
    const payment = recentPayments[i];
    console.log(`\n   💳 Checking payment ${payment.payment_number || payment.id}:`);

    const logs = await checkPaymentLogs(payment.id);
    console.log(`      Found ${logs.length} log records`);

    if (logs.length > 0) {
      totalPaymentLogs += logs.length;
      logs.forEach((record, index) => {
        console.log(`      ${index + 1}. ${record.action}: ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
        console.log(`         Processed by: ${record.processed_by_name || 'System'} at ${record.created_at}`);
        if (record.notes) console.log(`         Notes: ${record.notes}`);
      });
    } else {
      console.log(`      ❌ No log records found for payment ${payment.payment_number || payment.id}`);
    }
  }

  // Step 6: Summary
  console.log('\n📊 TRACKING TABLES TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Recent Bookings Checked: ${Math.min(3, recentBookings.length)}`);
  console.log(`✅ Total Booking History Records: ${totalHistoryRecords}`);
  console.log(`✅ Recent Payments Checked: ${Math.min(3, recentPayments.length)}`);
  console.log(`✅ Total Payment Log Records: ${totalPaymentLogs}`);

  if (totalHistoryRecords > 0 && totalPaymentLogs > 0) {
    console.log('\n🎉 SUCCESS: Both tracking tables are working perfectly!');
    console.log('✅ booking_history table is populated and accessible via API');
    console.log('✅ payment_logs table is populated and accessible via API');
    console.log('✅ Auto-logging implementation is working correctly');
  } else if (totalHistoryRecords > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: booking_history is working, payment_logs may need attention');
  } else if (totalPaymentLogs > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: payment_logs is working, booking_history may need attention');
  } else {
    console.log('\n❌ ISSUE: Both tracking tables appear to be empty or inaccessible');
    console.log('   This could mean:');
    console.log('   - Auto-logging is not working');
    console.log('   - API endpoints are not working');
    console.log('   - No recent activity to track');
  }

  console.log('\n🔍 RECOMMENDATION:');
  if (totalHistoryRecords === 0 && totalPaymentLogs === 0) {
    console.log('   Run the comprehensive test (test-tracking-tables.js) to generate new data');
    console.log('   Then run this test again to verify the tracking tables are populated');
  } else {
    console.log('   Tracking tables implementation is working correctly!');
    console.log('   You can now use the enhanced manager dashboard with timeline features');
  }
}

// Run the test
testTrackingTablesViaAPI().catch(console.error);
