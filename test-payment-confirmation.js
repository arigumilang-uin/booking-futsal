// Test Script: Verify Payment Confirmation Fix
// This script tests the enhanced payment confirmation for booking payments

import axios from 'axios';

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const kasirCredentials = { email: 'ppwweebb04@gmail.com', password: 'futsaluas' };

let authCookies = '';

// Create axios instance with cookie support
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login as kasir
async function loginAsKasir() {
  try {
    console.log('🔐 Logging in as kasir...');
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, kasirCredentials);
    
    if (response.data.success) {
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        authCookies = cookies.join('; ');
        console.log('✅ Kasir login successful');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Kasir login failed:', error.response?.data || error.message);
    return false;
  }
}

// Get pending payments
async function getPendingPayments() {
  try {
    console.log('\n📊 Getting pending payments...');
    const response = await axiosInstance.get(`${BASE_URL}/staff/kasir/payments`, {
      headers: { 'Cookie': authCookies }
    });

    if (response.data.success) {
      const payments = response.data.data;
      const pendingPayments = payments.filter(p => p.status === 'pending');
      
      console.log(`✅ Found ${pendingPayments.length} pending payments`);
      
      if (pendingPayments.length > 0) {
        console.log('📋 Sample pending payments:');
        pendingPayments.slice(0, 3).forEach((payment, index) => {
          console.log(`   ${index + 1}. ID: ${payment.id}, Booking: ${payment.booking_id}, Amount: ${payment.amount}, Customer: ${payment.user_name}`);
        });
      }
      
      return pendingPayments;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to get pending payments:', error.response?.data || error.message);
    return [];
  }
}

// Test payment confirmation
async function testPaymentConfirmation(paymentId, isBookingPayment = false) {
  try {
    console.log(`\n💳 Testing payment confirmation for: ${paymentId}`);
    
    const confirmationData = {
      method: 'cash',
      amount: 105000,
      notes: `Test confirmation by kasir - ${new Date().toISOString()}`
    };

    const response = await axiosInstance.put(
      `${BASE_URL}/staff/kasir/payments/${paymentId}/confirm`,
      confirmationData,
      {
        headers: { 'Cookie': authCookies }
      }
    );

    if (response.data.success) {
      console.log('✅ Payment confirmation successful!');
      console.log('📄 Response:', {
        message: response.data.message,
        type: response.data.data?.type || 'regular_payment',
        paymentId: response.data.data?.payment?.id || response.data.data?.id,
        bookingId: response.data.data?.booking_id || response.data.data?.booking_id
      });
      
      return { success: true, data: response.data };
    }
    
    return { success: false, error: 'API response not successful' };
  } catch (error) {
    console.error(`❌ Payment confirmation failed for ${paymentId}:`, {
      status: error.response?.status,
      error: error.response?.data?.error,
      code: error.response?.data?.code,
      details: error.response?.data?.details
    });
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
}

// Verify payment after confirmation
async function verifyPaymentAfterConfirmation() {
  try {
    console.log('\n🔍 Verifying payments after confirmation...');
    const response = await axiosInstance.get(`${BASE_URL}/staff/kasir/payments`, {
      headers: { 'Cookie': authCookies }
    });

    if (response.data.success) {
      const payments = response.data.data;
      const statusBreakdown = payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Payment status after confirmation:', statusBreakdown);
      
      const recentPaidPayments = payments
        .filter(p => p.status === 'paid')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
        
      if (recentPaidPayments.length > 0) {
        console.log('✅ Recent paid payments:');
        recentPaidPayments.forEach((payment, index) => {
          console.log(`   ${index + 1}. ID: ${payment.id}, Amount: ${payment.amount}, Method: ${payment.method}`);
        });
      }
      
      return statusBreakdown;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to verify payments:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runPaymentConfirmationTest() {
  console.log('🚀 PAYMENT CONFIRMATION TEST');
  console.log('============================\n');

  // Step 1: Login as kasir
  const loginSuccess = await loginAsKasir();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without kasir login. Exiting...');
    return;
  }

  // Step 2: Get pending payments
  const pendingPayments = await getPendingPayments();
  if (pendingPayments.length === 0) {
    console.log('⚠️  No pending payments found to test confirmation');
    return;
  }

  // Step 3: Test confirmation for first pending payment
  const testPayment = pendingPayments[0];
  const isBookingPayment = testPayment.id.toString().startsWith('booking_');
  
  console.log(`\n🎯 Testing confirmation for: ${testPayment.id} (${isBookingPayment ? 'Booking Payment' : 'Regular Payment'})`);
  
  const confirmationResult = await testPaymentConfirmation(testPayment.id, isBookingPayment);

  // Step 4: Verify results
  if (confirmationResult.success) {
    console.log('\n⏳ Waiting 2 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await verifyPaymentAfterConfirmation();
  }

  // Step 5: Final summary
  console.log('\n🏁 TEST SUMMARY:');
  console.log('================');
  
  if (confirmationResult.success) {
    console.log('✅ Payment Confirmation: SUCCESS');
    console.log(`   - Payment ID: ${testPayment.id}`);
    console.log(`   - Type: ${isBookingPayment ? 'Booking Payment' : 'Regular Payment'}`);
    console.log(`   - Amount: ${testPayment.amount}`);
    console.log(`   - Customer: ${testPayment.user_name}`);
    console.log('   - Status: Confirmed and processed');
  } else {
    console.log('❌ Payment Confirmation: FAILED');
    console.log(`   - Error: ${confirmationResult.error}`);
    console.log(`   - Status Code: ${confirmationResult.status}`);
  }

  // Test additional pending payments if available
  if (pendingPayments.length > 1 && confirmationResult.success) {
    console.log(`\n🔄 Testing additional pending payments (${pendingPayments.length - 1} remaining)...`);
    
    for (let i = 1; i < Math.min(3, pendingPayments.length); i++) {
      const additionalPayment = pendingPayments[i];
      console.log(`\n📋 Testing payment ${i + 1}: ${additionalPayment.id}`);
      
      const additionalResult = await testPaymentConfirmation(additionalPayment.id);
      if (additionalResult.success) {
        console.log(`✅ Payment ${additionalPayment.id} confirmed successfully`);
      } else {
        console.log(`❌ Payment ${additionalPayment.id} confirmation failed: ${additionalResult.error}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 PAYMENT CONFIRMATION TEST COMPLETED!');
  return confirmationResult.success;
}

// Run the test
runPaymentConfirmationTest().catch(console.error);
