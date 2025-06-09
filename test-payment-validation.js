// Test Payment Validation Implementation
// This script tests the new business rule: Payment must be completed before booking confirmation

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const testCredentials = {
  operator: { email: 'ppwweebb03@gmail.com', password: 'futsaluas' },
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' },
  customer: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' }
};

let authTokens = {};

async function login(role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testCredentials[role]);
    if (response.data.success) {
      authTokens[role] = response.data.token;
      console.log(`✅ ${role} login successful`);
      return response.data.token;
    }
  } catch (error) {
    console.error(`❌ ${role} login failed:`, error.response?.data || error.message);
    return null;
  }
}

async function createTestBooking() {
  try {
    const token = authTokens.customer;
    const bookingData = {
      field_id: 1,
      date: '2025-06-15',
      start_time: '10:00:00',
      end_time: '12:00:00',
      name: 'Test Payment Validation',
      phone: '081234567890',
      email: 'test@example.com',
      notes: 'Testing payment validation business rule'
    };

    const response = await axios.post(`${BASE_URL}/customer/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
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

async function testOperatorConfirmWithoutPayment(bookingId) {
  try {
    const token = authTokens.operator;
    const response = await axios.put(`${BASE_URL}/staff/operator/bookings/${bookingId}/confirm`, {
      notes: 'Testing confirmation without payment'
    }, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = authTokens.manager;
    const response = await axios.put(`${BASE_URL}/staff/manager/bookings/${bookingId}/status`, {
      status: 'confirmed',
      reason: 'Testing manager confirmation without payment'
    }, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = authTokens.kasir;
    const response = await axios.post(`${BASE_URL}/staff/kasir/payments/manual`, {
      booking_id: bookingId,
      method: 'cash',
      amount: 100000,
      notes: 'Test payment for validation',
      reference_number: 'TEST-PAY-001'
    }, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = authTokens.operator;
    const response = await axios.put(`${BASE_URL}/staff/operator/bookings/${bookingId}/confirm`, {
      notes: 'Testing confirmation with payment completed'
    }, {
      headers: { Authorization: `Bearer ${token}` }
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

async function runPaymentValidationTest() {
  console.log('🧪 TESTING PAYMENT VALIDATION BUSINESS RULE');
  console.log('=' .repeat(60));

  // Step 1: Login all roles
  console.log('\n📝 Step 1: Login all test users');
  await login('customer');
  await login('operator');
  await login('manager');
  await login('kasir');

  // Step 2: Create test booking
  console.log('\n📝 Step 2: Create test booking');
  const booking = await createTestBooking();
  if (!booking) {
    console.log('❌ Test failed: Could not create booking');
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
  console.log('=' .repeat(60));
  console.log(`Operator blocked without payment: ${operatorTestWithoutPayment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Manager blocked without payment: ${managerTestWithoutPayment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Payment processing: ${paymentProcessed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Operator allowed with payment: ${operatorTestWithPayment ? '✅ PASS' : '❌ FAIL'}`);

  const allTestsPassed = operatorTestWithoutPayment && managerTestWithoutPayment && paymentProcessed && operatorTestWithPayment;
  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
}

// Run the test
runPaymentValidationTest().catch(console.error);
