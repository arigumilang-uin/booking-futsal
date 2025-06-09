// Simple Payment Validation Test
// Test the new business rule: Payment must be completed before booking confirmation

const axios = require('axios');

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const testCredentials = {
  operator: { email: 'ppwweebb03@gmail.com', password: 'futsaluas' },
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' }
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

async function getExistingBooking() {
  try {
    // Get any existing bookings from manager endpoint (any status)
    const response = await axiosInstance.get(`${BASE_URL}/staff/manager/bookings?limit=5`, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    if (response.data.success && response.data.data.length > 0) {
      // Look for a booking with pending payment status
      const bookingWithPendingPayment = response.data.data.find(b =>
        b.payment_status === 'pending' && b.status === 'pending'
      );

      if (bookingWithPendingPayment) {
        console.log(`✅ Found booking with pending payment: ${bookingWithPendingPayment.booking_number}`);
        return bookingWithPendingPayment;
      }

      // If no pending payment, use any pending booking
      const pendingBooking = response.data.data.find(b => b.status === 'pending');
      if (pendingBooking) {
        console.log(`✅ Found pending booking: ${pendingBooking.booking_number} (payment: ${pendingBooking.payment_status})`);
        return pendingBooking;
      }

      // Use any booking for testing
      const anyBooking = response.data.data[0];
      console.log(`ℹ️ Using existing booking for test: ${anyBooking.booking_number} (status: ${anyBooking.status}, payment: ${anyBooking.payment_status})`);
      return anyBooking;
    } else {
      console.log('ℹ️ No bookings found');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to get existing booking:', error.response?.data || error.message);
    return null;
  }
}

async function testOperatorConfirmWithoutPayment(bookingId) {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/staff/operator/bookings/${bookingId}/confirm`, {
      notes: 'Testing confirmation without payment'
    }, {
      headers: {
        'Cookie': authCookies.operator?.join('; ') || ''
      }
    });

    console.log('❌ UNEXPECTED: Operator confirmation succeeded without payment');
    return false;
  } catch (error) {
    if (error.response?.data?.code === 'PAYMENT_NOT_COMPLETED') {
      console.log('✅ EXPECTED: Operator confirmation blocked - payment not completed');
      console.log('   Error:', error.response.data.error);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testManagerConfirmWithoutPayment(bookingId) {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/staff/manager/bookings/${bookingId}/status`, {
      status: 'confirmed',
      reason: 'Testing manager confirmation without payment'
    }, {
      headers: {
        'Cookie': authCookies.manager?.join('; ') || ''
      }
    });

    console.log('❌ UNEXPECTED: Manager confirmation succeeded without payment');
    return false;
  } catch (error) {
    if (error.response?.data?.code === 'PAYMENT_NOT_COMPLETED') {
      console.log('✅ EXPECTED: Manager confirmation blocked - payment not completed');
      console.log('   Error:', error.response.data.error);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function processPayment(bookingId) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/staff/kasir/payments/manual`, {
      booking_id: bookingId,
      method: 'cash',
      amount: 100000,
      notes: 'Test payment for validation',
      reference_number: `TEST-PAY-${Date.now()}`
    }, {
      headers: {
        'Cookie': authCookies.kasir?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log('✅ Payment processed successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to process payment:', error.response?.data || error.message);
    return false;
  }
}

async function testOperatorConfirmWithPayment(bookingId) {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/staff/operator/bookings/${bookingId}/confirm`, {
      notes: 'Testing confirmation with payment completed'
    }, {
      headers: {
        'Cookie': authCookies.operator?.join('; ') || ''
      }
    });

    if (response.data.success) {
      console.log('✅ EXPECTED: Operator confirmation succeeded after payment');
      return true;
    }
  } catch (error) {
    console.error('❌ UNEXPECTED: Operator confirmation failed after payment:', error.response?.data || error.message);
    return false;
  }
}

async function runSimplePaymentValidationTest() {
  console.log('🧪 SIMPLE PAYMENT VALIDATION TEST');
  console.log('='.repeat(50));

  // Step 1: Login all roles
  console.log('\n📝 Step 1: Login test users');
  const operatorLogin = await login('operator');
  const managerLogin = await login('manager');
  const kasirLogin = await login('kasir');

  if (!operatorLogin || !managerLogin || !kasirLogin) {
    console.log('❌ Test failed: Could not login all users');
    return;
  }

  // Step 2: Get existing booking
  console.log('\n📝 Step 2: Get existing pending booking');
  const booking = await getExistingBooking();
  if (!booking) {
    console.log('❌ Test failed: No pending booking found to test');
    return;
  }

  // Step 3: Test operator confirmation without payment (should fail)
  console.log('\n📝 Step 3: Test operator confirmation without payment (should fail)');
  const operatorTestWithoutPayment = await testOperatorConfirmWithoutPayment(booking.id);

  // Step 4: Test manager confirmation without payment (should fail)
  console.log('\n📝 Step 4: Test manager confirmation without payment (should fail)');
  const managerTestWithoutPayment = await testManagerConfirmWithoutPayment(booking.id);

  // Step 5: Process payment
  console.log('\n📝 Step 5: Process payment');
  const paymentProcessed = await processPayment(booking.id);

  // Step 6: Test operator confirmation with payment (should succeed)
  console.log('\n📝 Step 6: Test operator confirmation with payment (should succeed)');
  const operatorTestWithPayment = await testOperatorConfirmWithPayment(booking.id);

  // Results
  console.log('\n📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`Operator blocked without payment: ${operatorTestWithoutPayment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Manager blocked without payment: ${managerTestWithoutPayment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Payment processing: ${paymentProcessed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Operator allowed with payment: ${operatorTestWithPayment ? '✅ PASS' : '❌ FAIL'}`);

  const allTestsPassed = operatorTestWithoutPayment && managerTestWithoutPayment && paymentProcessed && operatorTestWithPayment;
  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allTestsPassed) {
    console.log('\n🎉 PAYMENT VALIDATION BUSINESS RULE IS WORKING PERFECTLY!');
    console.log('✅ Payment must be completed before booking confirmation');
    console.log('✅ Both operator and manager are blocked without payment');
    console.log('✅ Confirmation works after payment is processed');
  }
}

// Run the test
runSimplePaymentValidationTest().catch(console.error);
