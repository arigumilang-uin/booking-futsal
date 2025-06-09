// Test tracking tables with fresh booking creation
const axios = require('axios');

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const testCredentials = {
  customer: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' },
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

async function createFreshBooking() {
  try {
    // Get available field
    const fieldsResponse = await axiosInstance.get(`${BASE_URL}/public/fields`);
    const availableField = fieldsResponse.data.data[0];

    if (!availableField) {
      throw new Error('No available fields found');
    }

    // Create booking with very unique time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days from now
    const dateStr = futureDate.toISOString().split('T')[0];

    // Use current timestamp for unique time
    const timestamp = new Date().getTime();
    const uniqueMinutes = (timestamp % 60);
    const uniqueHour = 6 + (timestamp % 12); // 6AM-5PM
    const startTime = `${uniqueHour.toString().padStart(2, '0')}:${uniqueMinutes.toString().padStart(2, '0')}:00`;
    const endTime = `${(uniqueHour + 1).toString().padStart(2, '0')}:${uniqueMinutes.toString().padStart(2, '0')}:00`;

    const bookingData = {
      field_id: availableField.id,
      date: dateStr,
      start_time: startTime,
      end_time: endTime,
      name: 'Fresh Tracking Test',
      phone: '081234567890',
      email: 'fresh-test@example.com',
      notes: 'Testing fresh booking tracking implementation'
    };

    console.log(`   📅 Creating booking for ${dateStr} ${startTime}-${endTime} at field ${availableField.name}`);

    const response = await axiosInstance.post(`${BASE_URL}/customer/bookings`, bookingData, {
      headers: {
        'Cookie': authCookies.customer?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log(`✅ Fresh booking created: ${response.data.data.booking_number} (ID: ${response.data.data.id})`);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to create fresh booking:', error.response?.data || error.message);
    return null;
  }
}

async function processPaymentForBooking(bookingId) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/staff/kasir/payments/manual`, {
      booking_id: bookingId,
      method: 'cash',
      amount: 100000,
      notes: 'Fresh tracking test payment',
      reference_number: `FRESH-TRACK-${Date.now()}`
    }, {
      headers: {
        'Cookie': authCookies.kasir?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log(`✅ Payment processed: ${response.data.data.payment_number} (ID: ${response.data.data.id})`);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to process payment:', error.response?.data || error.message);
    return null;
  }
}

async function confirmBooking(bookingId) {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/staff/manager/bookings/${bookingId}/status`, {
      status: 'confirmed',
      reason: 'Fresh tracking test confirmation'
    }, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log(`✅ Booking confirmed successfully`);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to confirm booking:', error.response?.data || error.message);
    return null;
  }
}

async function checkTrackingTables(bookingId, paymentId) {
  console.log('\n🔍 CHECKING TRACKING TABLES IMMEDIATELY AFTER OPERATIONS');
  console.log('='.repeat(60));

  // Check booking history
  try {
    console.log(`\n📋 Checking booking history for booking ${bookingId}:`);
    const historyResponse = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (historyResponse.data.success) {
      const history = historyResponse.data.data || [];
      console.log(`   ✅ Found ${history.length} booking history records`);

      if (history.length > 0) {
        history.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.old_status || 'N/A'} → ${record.new_status || 'N/A'} (${record.action || 'unknown'})`);
          console.log(`      Changed by: ${record.changed_by_name || record.changed_by || 'Unknown'}`);
          console.log(`      Date: ${record.created_at}`);
          if (record.notes) console.log(`      Notes: ${record.notes}`);
          console.log('');
        });
      } else {
        console.log('   ❌ No booking history records found - auto-logging may not be working');
      }
    } else {
      console.log(`   ❌ Failed to get booking history: ${historyResponse.data.error}`);
    }
  } catch (error) {
    console.error(`   ❌ Error checking booking history:`, error.response?.data || error.message);
  }

  // Check payment logs
  if (paymentId) {
    try {
      console.log(`\n💳 Checking payment logs for payment ${paymentId}:`);
      const logsResponse = await axiosInstance.get(`${BASE_URL}/admin/payments/${paymentId}/logs`, {
        headers: {
          'Cookie': authCookies.manager?.join('; ') || ''
        }
      });

      if (logsResponse.data.success) {
        const logs = logsResponse.data.data || [];
        console.log(`   ✅ Found ${logs.length} payment log records`);

        if (logs.length > 0) {
          logs.forEach((record, index) => {
            console.log(`   ${index + 1}. Action: ${record.action || 'unknown'}`);
            console.log(`      Request: ${record.request_data ? 'Yes' : 'No'}`);
            console.log(`      Response: ${record.response_data ? 'Yes' : 'No'}`);
            console.log(`      Status Code: ${record.status_code || 'N/A'}`);
            console.log(`      Date: ${record.created_at}`);
            if (record.error_message) console.log(`      Error: ${record.error_message}`);
            console.log('');
          });
        } else {
          console.log('   ❌ No payment log records found - auto-logging may not be working');
        }
      } else {
        console.log(`   ❌ Failed to get payment logs: ${logsResponse.data.error}`);
      }
    } catch (error) {
      console.error(`   ❌ Error checking payment logs:`, error.response?.data || error.message);
    }
  }
}

async function testFreshTrackingTables() {
  console.log('🧪 TESTING FRESH TRACKING TABLES IMPLEMENTATION');
  console.log('='.repeat(70));
  console.log('Creating fresh booking and immediately checking tracking tables');
  console.log('='.repeat(70));

  // Step 1: Login all roles
  console.log('\n📝 Step 1: Login test users');
  const customerLogin = await login('customer');
  const kasirLogin = await login('kasir');
  const managerLogin = await login('manager');

  if (!customerLogin || !kasirLogin || !managerLogin) {
    console.log('❌ Test failed: Could not login all users');
    return;
  }

  // Step 2: Create fresh booking
  console.log('\n📝 Step 2: Create fresh booking');
  const booking = await createFreshBooking();
  if (!booking) {
    console.log('❌ Test failed: Could not create fresh booking');
    return;
  }

  // Step 3: Check tracking after booking creation
  console.log('\n📝 Step 3: Check tracking after booking creation');
  await checkTrackingTables(booking.id, null);

  // Step 4: Process payment
  console.log('\n📝 Step 4: Process payment');
  const payment = await processPaymentForBooking(booking.id);
  if (!payment) {
    console.log('❌ Test failed: Could not process payment');
    return;
  }

  // Step 5: Check tracking after payment
  console.log('\n📝 Step 5: Check tracking after payment');
  await checkTrackingTables(booking.id, payment.id);

  // Step 6: Confirm booking
  console.log('\n📝 Step 6: Confirm booking');
  const confirmedBooking = await confirmBooking(booking.id);
  if (!confirmedBooking) {
    console.log('❌ Test failed: Could not confirm booking');
    return;
  }

  // Step 7: Final tracking check
  console.log('\n📝 Step 7: Final tracking check after confirmation');
  await checkTrackingTables(booking.id, payment.id);

  // Summary
  console.log('\n🎯 FRESH TRACKING TEST COMPLETED');
  console.log('='.repeat(60));
  console.log(`✅ Test booking: ${booking.booking_number} (ID: ${booking.id})`);
  console.log(`✅ Test payment: ${payment?.payment_number || 'N/A'} (ID: ${payment?.id || 'N/A'})`);
  console.log('\n📊 Expected tracking records:');
  console.log('   - booking_history: 2 records (pending→confirmed)');
  console.log('   - payment_logs: 2 records (created, processed)');
  console.log('\n🔍 If no tracking records found, auto-logging implementation needs debugging');
}

// Run the test
testFreshTrackingTables().catch(console.error);
