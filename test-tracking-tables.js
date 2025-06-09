// Test script untuk menguji implementasi booking_history dan payment_logs
const axios = require('axios');

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const testCredentials = {
  customer: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' },
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' },
  operator: { email: 'ppwweebb03@gmail.com', password: 'futsaluas' }
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

async function createTestBooking() {
  try {
    // Get available field
    const fieldsResponse = await axiosInstance.get(`${BASE_URL}/public/fields`);
    const availableField = fieldsResponse.data.data[0];
    
    if (!availableField) {
      throw new Error('No available fields found');
    }

    // Create booking with unique time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const uniqueTime = new Date().getTime() % 1000;
    const startHour = 14 + (uniqueTime % 6); // 14-19 (2PM-7PM)
    const endHour = startHour + 2;
    
    const bookingData = {
      field_id: availableField.id,
      date: dateStr,
      start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
      end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
      name: 'Test Tracking Tables',
      phone: '081234567890',
      email: 'test@example.com',
      notes: 'Testing booking_history and payment_logs implementation'
    };

    const response = await axiosInstance.post(`${BASE_URL}/customer/bookings`, bookingData, {
      headers: {
        'Cookie': authCookies.customer?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log(`✅ Test booking created: ${response.data.data.booking_number}`);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to create test booking:', error.response?.data || error.message);
    return null;
  }
}

async function processPayment(bookingId) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/staff/kasir/payments/manual`, {
      booking_id: bookingId,
      method: 'cash',
      amount: 100000,
      notes: 'Test payment for tracking tables',
      reference_number: `TEST-TRACK-${Date.now()}`
    }, {
      headers: {
        'Cookie': authCookies.kasir?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log('✅ Payment processed successfully');
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
      reason: 'Testing booking_history tracking'
    }, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log('✅ Booking confirmed successfully');
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to confirm booking:', error.response?.data || error.message);
    return null;
  }
}

async function completeBooking(bookingId) {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/staff/operator/bookings/${bookingId}/complete`, {
      notes: 'Testing booking completion tracking'
    }, {
      headers: {
        'Cookie': authCookies.operator?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log('✅ Booking completed successfully');
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Failed to complete booking:', error.response?.data || error.message);
    return null;
  }
}

async function checkDatabaseTables(bookingId, paymentId) {
  try {
    console.log('\n📊 CHECKING DATABASE TABLES');
    console.log('=' .repeat(50));
    
    // Check booking_history table
    const bookingHistoryResponse = await axiosInstance.get(`${BASE_URL}/admin/bookings/${bookingId}/history`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });
    
    if (bookingHistoryResponse.data.success) {
      const historyRecords = bookingHistoryResponse.data.data || [];
      console.log(`📋 BOOKING_HISTORY TABLE: ${historyRecords.length} records found`);
      historyRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.status_from} → ${record.status_to} by ${record.changed_by_name || 'System'} at ${record.created_at}`);
      });
    } else {
      console.log('❌ Failed to get booking history');
    }
    
    // Check payment_logs table
    if (paymentId) {
      const paymentLogsResponse = await axiosInstance.get(`${BASE_URL}/admin/payments/${paymentId}/logs`, {
        headers: {
          'Cookie': authCookies.manager?.join('; ') || ''
        }
      });
      
      if (paymentLogsResponse.data.success) {
        const logRecords = paymentLogsResponse.data.data || [];
        console.log(`💳 PAYMENT_LOGS TABLE: ${logRecords.length} records found`);
        logRecords.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.action}: ${record.status_from} → ${record.status_to} at ${record.created_at}`);
        });
      } else {
        console.log('❌ Failed to get payment logs');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database tables:', error.response?.data || error.message);
  }
}

async function runTrackingTablesTest() {
  console.log('🧪 TESTING TRACKING TABLES IMPLEMENTATION');
  console.log('=' .repeat(60));
  console.log('Testing booking_history and payment_logs auto-logging');
  console.log('=' .repeat(60));

  // Step 1: Login all roles
  console.log('\n📝 Step 1: Login test users');
  const customerLogin = await login('customer');
  const kasirLogin = await login('kasir');
  const managerLogin = await login('manager');
  const operatorLogin = await login('operator');

  if (!customerLogin || !kasirLogin || !managerLogin || !operatorLogin) {
    console.log('❌ Test failed: Could not login all users');
    return;
  }

  // Step 2: Create test booking (should log to booking_history)
  console.log('\n📝 Step 2: Create test booking');
  const booking = await createTestBooking();
  if (!booking) {
    console.log('❌ Test failed: Could not create booking');
    return;
  }

  // Step 3: Process payment (should log to payment_logs)
  console.log('\n📝 Step 3: Process payment');
  const payment = await processPayment(booking.id);
  if (!payment) {
    console.log('❌ Test failed: Could not process payment');
    return;
  }

  // Step 4: Confirm booking (should log to booking_history)
  console.log('\n📝 Step 4: Confirm booking');
  const confirmedBooking = await confirmBooking(booking.id);
  if (!confirmedBooking) {
    console.log('❌ Test failed: Could not confirm booking');
    return;
  }

  // Step 5: Complete booking (should log to booking_history)
  console.log('\n📝 Step 5: Complete booking');
  const completedBooking = await completeBooking(booking.id);
  if (!completedBooking) {
    console.log('❌ Test failed: Could not complete booking');
    return;
  }

  // Step 6: Check database tables
  console.log('\n📝 Step 6: Check database tables');
  await checkDatabaseTables(booking.id, payment.id);

  console.log('\n🎯 TEST COMPLETED');
  console.log('=' .repeat(50));
  console.log('✅ Check your database tables:');
  console.log('   - booking_history: Should have 3 records (pending→confirmed→completed)');
  console.log('   - payment_logs: Should have 2 records (created, processed)');
  console.log('\n📋 Test booking details:');
  console.log(`   - Booking ID: ${booking.id}`);
  console.log(`   - Booking Number: ${booking.booking_number}`);
  console.log(`   - Payment ID: ${payment?.id || 'N/A'}`);
}

// Run the test
runTrackingTablesTest().catch(console.error);
